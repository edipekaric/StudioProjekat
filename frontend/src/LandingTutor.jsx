import React from "react";
import { useNavigate } from "react-router-dom";

const LandingTutor = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Clear authentication token
    navigate("/"); // Redirect to login page
  };

  const handleProfile = () => {
    navigate("/tutor-profile"); // Redirect to TutorProfile
  };

  return (
    <div style={styles.container}>
      {/* LOGO acting as a home button */}
      <div style={styles.logo} onClick={() => navigate("/landing-tutor")}>
        LOGO
      </div>

      {/* Right corner buttons */}
      <div style={styles.rightCorner}>
        <button style={styles.button} onClick={handleProfile}>
          Profile
        </button>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    backgroundColor: "#013220",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    position: "relative",
  },
  logo: {
    position: "absolute",
    top: "10px",
    left: "10px",
    fontSize: "1.5rem",
    color: "#fff",
    cursor: "pointer",
  },
  rightCorner: {
    position: "absolute",
    top: "10px",
    right: "10px",
    display: "flex",
    gap: "10px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  logoutButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default LandingTutor;
