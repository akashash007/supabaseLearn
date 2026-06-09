import { useState, useEffect } from "react";
import { supabase } from "../supabase-client";

interface Task {
    id: number;
    title: string;
    description: string;
    created_at: string;
}

export const Test = () => {
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [editId, setEditId] = useState<number | null>(null);

    const [task, setTasks] = useState<Task[]>([]);

    const getTasks = async () => {
        const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        setTasks(data);
    };

    useEffect(() => {
        getTasks();
    }, []);

    const handleAddTask = async (e: any) => {
        e.preventDefault();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            alert("Please login first");
            return;
        }

        if (editId) {
            const { error } = await supabase
                .from("tasks")
                .update({
                    title: taskTitle,
                    description: taskDescription,
                })
                .eq("id", editId);

            if (error) {
                console.error(error);
                return;
            }

            setEditId(null);
        } else {
            const { error } = await supabase
                .from("tasks")
                .insert({
                    title: taskTitle,
                    description: taskDescription,
                    user_id: user.id, // No TS error now
                });

            if (error) {
                console.error(error);
                return;
            }
        }

        setTaskTitle("");
        setTaskDescription("");
        getTasks();
    };

    const handleEdit = (task: any) => {
        setEditId(task.id);
        setTaskTitle(task.title);
        setTaskDescription(task.description);
    };

    const handleDelete = async (id: number) => {
        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", id);

        if (error) {
            console.error(error);
            return;
        }

        getTasks();
    };
    return (
        <>
            <div
                style={{
                    maxWidth: "900px",
                    margin: "40px auto",
                    padding: "20px",
                }}
            >
                <h1>Task Manager CRUD</h1>

                <div
                    style={{
                        border: "1px solid #ddd",
                        padding: "20px",
                        borderRadius: "8px",
                        marginBottom: "30px",
                    }}
                >
                    <div style={{ marginBottom: "16px" }}>
                        <label>Task Title</label>
                        <input
                            type="text"
                            placeholder="Enter task title"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginTop: "6px",
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label>Task Description</label>
                        <textarea
                            placeholder="Enter task description"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            rows={4}
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginTop: "6px",
                            }}
                        />
                    </div>

                    <button onClick={handleAddTask}>
                        Add Task
                    </button>
                </div>

                <h2>Task List</h2>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                                ID
                            </th>
                            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                                Title
                            </th>
                            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                                Description
                            </th>
                            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {task.map((task) => (
                            <tr key={task.id}>
                                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                                    {task.id}
                                </td>

                                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                                    {task.title}
                                </td>

                                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                                    {task.description}
                                </td>

                                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                                    <button
                                        style={{
                                            marginRight: "10px",
                                        }}
                                        onClick={() => handleEdit(task)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(task.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
