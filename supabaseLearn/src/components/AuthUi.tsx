import { useState } from "react";
import { supabase } from "../supabase-client";

export const AuthUI = () => {
    const [mode, setMode] = useState<"login" | "signup">("login");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const validate = () => {
        if (!email) {
            alert("Email is required");
            return false;
        }

        if (!email.includes("@")) {
            alert("Enter a valid email");
            return false;
        }

        if (!password) {
            alert("Password is required");
            return false;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!validate()) return;

        if (mode === "signup") {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                console.error("Signup error:", error.message);
                return;
            }

            alert("Signup successful");
        }

        if (mode === "login") {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error("Login error:", error.message);
                return;
            }

            alert("Login successful");
        }

        console.log({ email, password, mode });
    };

    return (
        <div
            style={{
                maxWidth: "400px",
                margin: "60px auto",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "10px",
            }}
        >
            <h2 style={{ textAlign: "center" }}>
                {mode === "login" ? "Login" : "Signup"}
            </h2>

            <form onSubmit={handleSubmit}>
                {/* EMAIL */}
                <div style={{ marginBottom: "15px" }}>
                    <label>Email</label>
                    <input
                        type="text"
                        value={email}
                        placeholder="Enter email"
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "5px",
                        }}
                    />
                </div>

                {/* PASSWORD */}
                <div style={{ marginBottom: "15px" }}>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        placeholder="Enter password"
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "5px",
                        }}
                    />
                </div>

                {/* SUBMIT */}
                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: "#111",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    {mode === "login" ? "Login" : "Signup"}
                </button>
            </form>

            {/* SWITCH MODE */}
            <p style={{ textAlign: "center", marginTop: "15px" }}>
                {mode === "login" ? (
                    <>
                        Don't have an account?{" "}
                        <span
                            style={{ color: "blue", cursor: "pointer" }}
                            onClick={() => setMode("signup")}
                        >
                            Signup
                        </span>
                    </>
                ) : (
                    <>
                        Already have an account?{" "}
                        <span
                            style={{ color: "blue", cursor: "pointer" }}
                            onClick={() => setMode("login")}
                        >
                            Login
                        </span>
                    </>
                )}
            </p>
        </div>
    );
};