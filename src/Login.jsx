import React, { useState } from "react";

const Login = () => {
  // Predefined user accounts
  const accounts = [
    { username: "edi", password: "password123" },
    { username: "tutor", password: "tutorpass" },
    { username: "student", password: "studentpass" },
  ];

  // State for username, password, and feedback messages
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    const account = accounts.find(
      (acc) => acc.username === username && acc.password === password
    );

    if (account) {
      setMessage("Login successful!");
    } else {
      setMessage("Invalid username or password.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>TutorLink</h1>
      <h1 style={styles.title}>Login</h1>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
      <br></br>
      <br></br>
      <br></br>
      <p>Please login to acces the website</p>
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
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#28a745", // Green button
    color: "#fff",
    cursor: "pointer",
  },
  message: {
    marginTop: "15px",
    fontSize: "1rem",
  },
};

export default Login;
