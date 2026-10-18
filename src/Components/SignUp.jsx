

import { useState } from "react";

function SignUp() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        console.log("Signup started");

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:5000/User", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            console.log("HTTP status:", response.status);
            console.log("Response OK:", response.ok);

            // Read the response body as text for debugging.
            const responseText = await response.text();

            console.log("Raw response:", responseText);

            let data = {};

            // Parse JSON only if the response body is not empty.
            if (responseText) {
                try {
                    data = JSON.parse(responseText);
                } catch (error) {
                    console.error("Invalid JSON response:", error);
                }
            }

            if (!response.ok) {
                setMessage(data.message || "Signup failed. Please try again.");
                return;
            }

            setMessage("Signup successful!");
            console.log("Success message set");

            // Clear the form after successful signup.
            setForm({
                name: "",
                email: "",
                password: ""
            });

        } catch (err) {
            console.error("Signup error:", err);
            setMessage("Unable to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h2>Create an Account</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={form.name}
                        placeholder="Enter your name"
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        placeholder="Enter your email"
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={form.password}
                        placeholder="Enter your password"
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Signing up..." : "Sign Up"}
                </button>
            </form>

            {message && (
                <p role="status" aria-live="polite">
                    {message}
                </p>
            )}
        </div>
    );
}

export default SignUp;