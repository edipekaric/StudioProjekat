import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student"); // Default role
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const credentials = {
      email,
      passvord: password,
      role,
    };

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      const { token } = await response.json();
      localStorage.setItem("authToken", token); // Save the token for authentication
      setMessage("Login successful!");

      // Redirect based on role
      if (role === "Student") {
        navigate("/landing-student");
      } else {
        navigate("/landing-tutor");
      }
    } catch (err) {
      setMessage(err.message || "Login failed.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Login</h1>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.select}
        >
          <option value="Student">Student</option>
          <option value="Tutor">Tutor</option>
        </select>
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
      {message && <p style={styles.message}>{message}</p>}

      {/* Link to register page */}
      <p
        style={styles.link}
        onClick={() => navigate("/register")} // Navigate to the register page
      >
        Don't have an account? Register
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#013220",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "300px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ddd",
    outline: "none",
  },
  select: {
    width: "108%",
    padding: "10px",
    marginBottom: "15px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ddd",
    outline: "none",
    backgroundColor: "#fff",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#28a745",
    color: "#fff",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    fontSize: "1rem",
  },
  link: {
    marginTop: "20px",
    color: "#ffc107",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "1rem",
  },
};

export default Login;
