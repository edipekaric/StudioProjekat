import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingStudent = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [currentTutorID, setCurrentTutorID] = useState(null);
  const [connectionMessage, setConnectionMessage] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/subjects", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        if (res.ok) {
          setSubjects(data.subjects || []);
        } else {
          throw new Error(data.error || "Failed to fetch subjects");
        }
      } catch (err) {
        setMessage(err.message);
      }
    };

    fetchSubjects();
  }, []);

  const handleSearch = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/search-tutors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectID: selectedSubject,
          hourlyRate: hourlyRate !== "" ? parseFloat(hourlyRate) : null,
          onlyVerified,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSearchResults(data.tutors || []);
        setMessage("");
      } else {
        throw new Error(data.error || "Failed to fetch tutors");
      }
    } catch (err) {
      setMessage(err.message);
      setSearchResults([]);
    }
  };

  const handleRequestConnection = (tutorID) => {
    setCurrentTutorID(tutorID);
    setShowPopup(true);
  };

  const handleSendRequest = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch("http://localhost:5000/api/request-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tutorID: currentTutorID,
          message: connectionMessage,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to send connection request.");
      }

      const data = await response.json();
      alert(data.message || "Connection request sent successfully!");
      setShowPopup(false);
    } catch (err) {
      alert(err.message || "An error occurred while sending the connection request.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <div style={styles.container}>
      {/* LOGO Placeholder */}
      <div style={styles.logo} onClick={() => navigate("/landing-student")}>
        LOGO
      </div>

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <h3 style={styles.filtersHeader}>Filters to search by:</h3>

        {/* Subject dropdown */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={styles.select}
        >
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject.subjectID} value={subject.subjectID}>
              {subject.name}
            </option>
          ))}
        </select>

        {/* Hourly rate input */}
        <input
          type="number"
          placeholder="Hourly rate"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          style={styles.input}
        />

        {/* Only verified checkbox */}
        <div style={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={onlyVerified}
            onChange={(e) => setOnlyVerified(e.target.checked)}
            style={styles.checkbox}
          />
          <label>Only verified tutors</label>
        </div>

        {/* Search button */}
        <button style={styles.button} onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* Search results */}
      <div style={styles.resultsContainer}>
        {message && <p style={styles.message}>{message}</p>}
        {searchResults.length === 0 && !message && <p>No results found.</p>}
        {searchResults.map((tutor) => (
          <div key={tutor.tutorID} style={styles.resultCard}>
            <div>
              <h4>{`${tutor.firstName} ${tutor.lastName}`}</h4>
              <p>Hourly Rate: ${tutor.hourlyRate}</p>
              <p>Subjects: {tutor.subjects}</p>
            </div>
            <button
              style={styles.requestButton}
              onClick={() => handleRequestConnection(tutor.tutorID)}
            >
              Request Connection
            </button>
          </div>
        ))}
      </div>

      {/* Popup */}
      {showPopup && (
        <div style={styles.popup}>
          <div style={styles.popupContent}>
            <h3>Send a message to the tutor</h3>
            <textarea
              value={connectionMessage}
              onChange={(e) => setConnectionMessage(e.target.value)}
              style={styles.textarea}
              placeholder="Write your message here..."
            />
            <button onClick={handleSendRequest} style={styles.sendButton}>
              Send
            </button>
            <button style={styles.closeButton} onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Logout and Requests Buttons */}
      <div style={styles.buttonContainer}>
        <button style={styles.requestsButton} onClick={() => navigate("/student-requests")}>
          Requests
        </button>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#013220",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logo: {
    position: "absolute",
    top: "10px",
    left: "10px",
    fontSize: "1.5rem",
    color: "#fff",
    cursor: "pointer",
  },
  filtersContainer: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#1e4620",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "300px",
  },
  filtersHeader: {
    marginBottom: "10px",
  },
  select: {
    width: "100%",
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ddd",
    outline: "none",
    height: "40px",
    boxSizing: "border-box",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ddd",
    outline: "none",
    height: "40px",
    boxSizing: "border-box",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  checkbox: {
    cursor: "pointer",
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
  resultsContainer: {
    marginTop: "20px",
    width: "100%",
  },
  resultCard: {
    backgroundColor: "#ffffff22",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "98%",
  },
  requestButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "10px",
    cursor: "pointer",
  },
  popup: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "400px",
    textAlign: "center",
  },
  textarea: {
    width: "95%",
    height: "100px",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  sendButton: {
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
  },
  closeButton: {
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  buttonContainer: {
    position: "absolute",
    top: "10px",
    right: "10px",
    display: "flex",
    gap: "10px",
  },
  requestsButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#007bff",
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

export default LandingStudent;
