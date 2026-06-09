import { useState } from "react";
import { supabase } from "../supabase-client";

interface FieldErrors {
    email?: string;
    password?: string;
}

interface Toast {
    id: number;
    type: "success" | "error";
    message: string;
}

let toastId = 0;

export const AuthUI = () => {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);

    const addToast = (type: "success" | "error", message: string) => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    };

    const validate = (): boolean => {
        const errs: FieldErrors = {};
        if (!email) errs.email = "Email is required";
        else if (!email.includes("@")) errs.email = "Enter a valid email address";
        if (!password) errs.password = "Password is required";
        else if (password.length < 6) errs.password = "At least 6 characters required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        setApiError(null);

        if (mode === "signup") {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setApiError(error.message);
            } else {
                addToast("success", "Account created — check your email!");
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setApiError("Incorrect email or password.");
            }
        }

        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSubmit();
    };

    const switchMode = () => {
        setMode(mode === "login" ? "signup" : "login");
        setErrors({});
        setApiError(null);
    };

    return (
        <>
            <div className="auth-page">
                <div className="auth-card">
                    {/* Brand */}
                    <div className="auth-logo">
                        <div className="auth-logo-mark">✦</div>
                        <span className="auth-logo-text">Taskflow</span>
                    </div>

                    <h1 className="auth-title">
                        {mode === "login" ? "Welcome back" : "Create account"}
                    </h1>
                    <p className="auth-subtitle">
                        {mode === "login"
                            ? "Sign in to manage your tasks"
                            : "Get started — it only takes a moment"}
                    </p>

                    {/* API-level error */}
                    {apiError && (
                        <div className="inline-error" role="alert">
                            <span>⚠</span> {apiError}
                        </div>
                    )}

                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="auth-email">
                            Email
                        </label>
                        <input
                            id="auth-email"
                            className="form-input"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                            }}
                            onKeyDown={handleKeyDown}
                            aria-describedby={errors.email ? "email-err" : undefined}
                            aria-invalid={!!errors.email}
                        />
                        {errors.email && (
                            <p className="field-error" id="email-err" role="alert">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="auth-password">
                            Password
                        </label>
                        <input
                            id="auth-password"
                            className="form-input"
                            type="password"
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                            placeholder={mode === "login" ? "Your password" : "Min 6 characters"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                            }}
                            onKeyDown={handleKeyDown}
                            aria-describedby={errors.password ? "pw-err" : undefined}
                            aria-invalid={!!errors.password}
                        />
                        {errors.password && (
                            <p className="field-error" id="pw-err" role="alert">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        className="btn btn-primary btn-block"
                        onClick={handleSubmit}
                        disabled={loading}
                        aria-label={mode === "login" ? "Sign in" : "Create account"}
                        style={{ marginTop: "8px" }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" />
                                {mode === "login" ? "Signing in…" : "Creating account…"}
                            </>
                        ) : (
                            mode === "login" ? "Sign in" : "Create account"
                        )}
                    </button>

                    {/* Switch mode */}
                    <p className="auth-footer">
                        {mode === "login" ? "No account? " : "Already have one? "}
                        <button className="auth-footer-link" onClick={switchMode}>
                            {mode === "login" ? "Sign up" : "Sign in"}
                        </button>
                    </p>
                </div>
            </div>

            {/* Toasts */}
            <div className="toast-container" aria-live="polite">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.type}`} role="status">
                        <span className="toast-dot" />
                        {t.message}
                    </div>
                ))}
            </div>
        </>
    );
};