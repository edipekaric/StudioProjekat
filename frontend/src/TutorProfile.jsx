import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TutorProfile = () => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]); // List of all subjects
  const [selectedSubjects, setSelectedSubjects] = useState(["", "", ""]); // User's selected subjects
  const [hourlyRate, setHourlyRate] = useState(""); // Hourly rate
  const [message, setMessage] = useState(""); // Success/error message

  // Fetch available subjects and tutor data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tutor-profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setSubjects(data.subjects || []); // Populate dropdown with all subjects
          setSelectedSubjects(data.selectedSubjectIDs || ["", "", ""]);
          setHourlyRate(data.hourlyRate || "");
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        setMessage(err.message);
      }
    };

    fetchData();
  }, []);

  // Handle subject selection changes
  const handleSubjectChange = (index, value) => {
    const newSelectedSubjects = [...selectedSubjects];
    newSelectedSubjects[index] = value;
    setSelectedSubjects(newSelectedSubjects);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/update-tutor-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          selectedSubjectIDs: selectedSubjects.filter((subject) => subject !== ""),
          hourlyRate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Changes applied successfully!");
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div style={styles.container}>
      {/* LOGO acting as a home button */}
      <img
        src="a.jpg"
        alt="Logo"
        style={styles.logo}
        onClick={() => navigate("/landing-tutor")}
      />


      {/* Main content */}
      <div style={styles.profileContainer}>
        <h2 style={styles.header}>Tutor Profile</h2>

        {/* Subject selection */}
        <div style={styles.subjectContainer}>
          <h3 style={styles.subHeader}>Select Subjects</h3>
          {Array.from({ length: 3 }).map((_, index) => (
            <select
              key={index}
              value={selectedSubjects[index]}
              onChange={(e) => handleSubjectChange(index, e.target.value)}
              style={styles.select}
            >
              <option value="" disabled>
                Select Subject
              </option>
              {subjects
                .filter(
                  (subject) =>
                    !selectedSubjects.includes(subject.subjectID) ||
                    selectedSubjects[index] === subject.subjectID
                )
                .map((subject) => (
                  <option key={subject.subjectID} value={subject.subjectID}>
                    {subject.name}
                  </option>
                ))}
            </select>
          ))}
        </div>

        {/* Hourly rate */}
        <div style={styles.hourlyContainer}>
          <h3 style={styles.subHeader}>Set Hourly Rate</h3>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="Enter hourly rate"
            style={styles.input}
          />
        </div>

        {/* Apply Changes Button */}
        <button style={styles.button} onClick={handleSubmit}>
          Apply Changes
        </button>

        {/* Success/Error Message */}
        {message && <p style={styles.message}>{message}</p>}
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
    padding: "20px",
  },
  logo: {
    position: "absolute",
    top: "7px",
    left: "7px",
    width: "100px", // Width of the image
    height: "20px", // Height of the image
    cursor: "pointer",
  },
  profileContainer: {
    marginTop: "50px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    marginBottom: "20px",
  },
  subjectContainer: {
    marginBottom: "20px",
  },
  subHeader: {
    marginBottom: "10px",
  },
  select: {
    width: "200px",
    padding: "10px",
    marginBottom: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ddd",
    outline: "none",
  },
  hourlyContainer: {
    marginBottom: "20px",
  },
  input: {
    width: "200px",
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ddd",
    outline: "none",
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
  message: {
    marginTop: "10px",
    color: "#ffcc00",
  },
};

export default TutorProfile;
