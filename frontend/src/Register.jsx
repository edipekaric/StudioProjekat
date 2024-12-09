import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Student"); // Added state for role
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate(); // Initialize navigate

  const handleRegister = async (e) => {
    e.preventDefault();

    // Ensure passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Ensure consent is given
    if (!consent) {
      setError("You must consent to location sharing.");
      return;
    }

    const userData = {
      firstName,
      lastName,
      address: residentialAddress,
      email,
      phoneNum: phoneNumber,
      passvord: password,
      birthDate: dateOfBirth,
      role, // Pass Student or Tutor
    };

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      alert("Registration successful");
      navigate("/"); // Redirect to the login page
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Register</h1>
      <form onSubmit={handleRegister} style={styles.form}>
        <input
          type="text"
          placeholder="First Name *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Last Name *"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Residential Address (Optional)"
          value={residentialAddress}
          onChange={(e) => setResidentialAddress(e.target.value)}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="tel"
          placeholder="Phone Number (Optional)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password *"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Confirm Password *"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.input} // Reusing the input style for consistency
        >
          <option value="Student">Student</option>
          <option value="Tutor">Tutor</option>
        </select>
        <input
          type="date"
          placeholder="Date of Birth *"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          style={styles.input}
        />
        <div style={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={styles.checkbox}
          />
          <label style={styles.checkboxLabel}>
            Consent to location sharing while using the website
          </label>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>
          Register
        </button>
      </form>
      <p style={styles.link} onClick={() => navigate("/")}>
        Already have an account? Login
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
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
    width: "100%",
  },
  checkbox: {
    marginRight: "10px",
  },
  checkboxLabel: {
    color: "#fff",
    fontSize: "1rem",
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
  error: {
    color: "#ff4d4d",
    fontSize: "1rem",
    marginBottom: "10px",
  },
  link: {
    marginTop: "20px",
    color: "#ffc107",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default Register;
