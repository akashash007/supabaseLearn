import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase-client";

interface Task {
    id: number;
    title: string;
    description: string;
    created_at: string;
}

interface Toast {
    id: number;
    type: "success" | "error";
    message: string;
}

let toastCounter = 0;

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton skeleton-bullet" />
        <div className="skeleton-lines">
            <div className="skeleton skeleton-line" style={{ width: "55%", maxWidth: 200 }} />
            <div className="skeleton skeleton-line" style={{ width: "80%", maxWidth: 320 }} />
            <div className="skeleton skeleton-line" style={{ width: "30%", maxWidth: 100, marginBottom: 0, opacity: 0.5 }} />
        </div>
    </div>
);

export const TaskManager = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [editId, setEditId] = useState<number | null>(null);

    const [titleError, setTitleError] = useState("");
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const addToast = (type: "success" | "error", message: string) => {
        const id = ++toastCounter;
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    };

    const getTasks = useCallback(async () => {
        setFetchError(null);
        const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            setFetchError("Couldn't load tasks. Try refreshing.");
            return;
        }
        setTasks(data ?? []);
    }, []);

    useEffect(() => {
        getTasks().finally(() => setLoading(false));
    }, [getTasks]);

    const handleSubmit = async () => {
        const trimmedTitle = taskTitle.trim();
        if (!trimmedTitle) {
            setTitleError("Task title is required");
            return;
        }
        setTitleError("");
        setSubmitting(true);

        if (editId !== null) {
            const { error } = await supabase
                .from("tasks")
                .update({ title: trimmedTitle, description: taskDescription.trim() })
                .eq("id", editId);

            if (error) {
                addToast("error", "Failed to update task.");
            } else {
                addToast("success", "Task updated.");
                setEditId(null);
            }
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { addToast("error", "Session expired. Please sign in again."); setSubmitting(false); return; }

            const { error } = await supabase
                .from("tasks")
                .insert({ title: trimmedTitle, description: taskDescription.trim(), user_id: user.id });

            if (error) {
                addToast("error", "Failed to add task.");
            } else {
                addToast("success", "Task added.");
            }
        }

        setTaskTitle("");
        setTaskDescription("");
        setSubmitting(false);
        await getTasks();
    };

    const handleEdit = (task: Task) => {
        setEditId(task.id);
        setTaskTitle(task.title);
        setTaskDescription(task.description);
        setTitleError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setEditId(null);
        setTaskTitle("");
        setTaskDescription("");
        setTitleError("");
    };

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        const { error } = await supabase.from("tasks").delete().eq("id", id);
        if (error) {
            addToast("error", "Failed to delete task.");
        } else {
            addToast("success", "Task deleted.");
            setTasks((prev) => prev.filter((t) => t.id !== id));
        }
        setDeletingId(null);
        if (editId === id) handleCancelEdit();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && e.metaKey) handleSubmit();
    };

    return (
        <>
            <div className="app-main">
                {/* Page header */}
                <div className="tasks-header">
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <h1 className="tasks-header-title">My Tasks</h1>
                            {!loading && (
                                <span className="tasks-count-badge">{tasks.length}</span>
                            )}
                        </div>
                        <p className="tasks-header-sub">
                            {loading ? "Loading…" : tasks.length === 0 ? "No tasks yet — add your first below" : `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
                        </p>
                    </div>
                </div>

                {/* Add / Edit form */}
                <div className="task-form-card">
                    <div className="task-form-header">
                        <svg className="task-form-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="10" cy="10" r="8" />
                            <path d="M10 7v3l2 2" strokeLinecap="round" />
                        </svg>
                        {editId ? "Edit task" : "New task"}
                    </div>

                    {editId && (
                        <div className="edit-banner">
                            <span className="edit-banner-dot" />
                            Editing task #{editId} — save to confirm changes
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="task-title">Title</label>
                        <input
                            id="task-title"
                            className="form-input"
                            type="text"
                            placeholder="What needs to get done?"
                            value={taskTitle}
                            onChange={(e) => { setTaskTitle(e.target.value); if (titleError) setTitleError(""); }}
                            onKeyDown={handleKeyDown}
                            aria-invalid={!!titleError}
                            aria-describedby={titleError ? "title-err" : undefined}
                        />
                        {titleError && <p className="field-error" id="title-err" role="alert">{titleError}</p>}
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="task-desc">
                            Description <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span>
                        </label>
                        <textarea
                            id="task-desc"
                            className="form-textarea"
                            placeholder="Add more detail…  (⌘ + Enter to save)"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <div className="task-form-actions">
                        {editId && (
                            <button className="btn btn-ghost" onClick={handleCancelEdit} disabled={submitting}>
                                Cancel
                            </button>
                        )}
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <span className="spinner" />
                                    {editId ? "Saving…" : "Adding…"}
                                </>
                            ) : editId ? "Save changes" : "Add task"}
                        </button>
                    </div>
                </div>

                {/* Task list */}
                <div>
                    <div className="task-list-header">
                        <span className="task-list-title">All tasks</span>
                    </div>

                    {fetchError && (
                        <div className="inline-error" role="alert" style={{ marginBottom: 16 }}>
                            <span>⚠</span> {fetchError}
                            <button
                                className="btn btn-ghost"
                                style={{ marginLeft: "auto", padding: "4px 10px", fontSize: 12 }}
                                onClick={() => { setLoading(true); getTasks().finally(() => setLoading(false)); }}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="task-list">
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    ) : tasks.length === 0 && !fetchError ? (
                        <div className="empty-state">
                            <div className="empty-icon">📋</div>
                            <p className="empty-title">No tasks yet</p>
                            <p className="empty-sub">Add your first task using the form above</p>
                        </div>
                    ) : (
                        <div className="task-list">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`task-card${editId === task.id ? " is-editing" : ""}`}
                                >
                                    <span className="task-card-bullet" />

                                    <div className="task-card-content">
                                        <div className="task-card-title">{task.title}</div>
                                        {task.description && (
                                            <div className="task-card-desc">{task.description}</div>
                                        )}
                                        <div className="task-card-meta">{formatDate(task.created_at)}</div>
                                    </div>

                                    <div className="task-card-actions">
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            onClick={() => handleEdit(task)}
                                            disabled={deletingId === task.id}
                                            aria-label={`Edit task: ${task.title}`}
                                            title="Edit"
                                        >
                                            ✏
                                        </button>
                                        <button
                                            className="btn btn-danger btn-icon"
                                            onClick={() => handleDelete(task.id)}
                                            disabled={deletingId === task.id}
                                            aria-label={`Delete task: ${task.title}`}
                                            title="Delete"
                                        >
                                            {deletingId === task.id ? <span className="spinner" style={{ borderTopColor: "var(--danger)" }} /> : "✕"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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