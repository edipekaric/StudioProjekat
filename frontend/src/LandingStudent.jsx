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
            <h4>{`${tutor.firstName} ${tutor.lastName}`}</h4>
            <p>Hourly Rate: ${tutor.hourlyRate}</p>
            <p>Subjects: {tutor.subjects}</p>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <button style={styles.logoutButton} onClick={handleLogout}>
        Log out
      </button>
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
    width: "98%",
  },
  logoutButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  message: {
    color: "#ffcc00",
  },
};

export default LandingStudent;
