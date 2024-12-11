import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingTutor = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const response = await fetch("http://localhost:5000/api/tutor-requests", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || "Failed to fetch requests.");
        }

        const data = await response.json();
        setRequests(data.requests || []);
      } catch (err) {
        setError(err.message || "An error occurred while fetching requests.");
      }
    };

    fetchRequests();
  }, []);

  const handleUpdateStatus = async (requestID, status) => {
    try {
      const token = localStorage.getItem("authToken");
  
      const response = await fetch("http://localhost:5000/api/update-request-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          connectionRequestID: requestID,
          status,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error("Update failed:", data.error);
        throw new Error(data.error || "Failed to update request status.");
      }
  
      // Update status locally
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.connectionRequestID === requestID
            ? { ...request, status }
            : request
        )
      );
  
      alert(`Request marked as ${status.toLowerCase()} successfully!`);
    } catch (err) {
      alert(err.message || "An error occurred while updating the request.");
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const handleProfile = () => {
    navigate("/tutor-profile");
  };

  return (
    <div style={styles.container}>
      <img
        src="a.jpg"
        alt="Logo"
        style={styles.logo}
        onClick={() => navigate("/landing-tutor")}
      />



      <div style={styles.requestsContainer}>
        <h2>Connection Requests</h2>
        {error && <p style={styles.error}>{error}</p>}
        {requests.length === 0 ? (
          <p>No connection requests found.</p>
        ) : (
          requests.map((request) => (
            <div key={request.connectionRequestID} style={styles.requestCard}>
              <p><strong>Student Name:</strong> {request.studentName}</p>
              <p><strong>Message:</strong> {request.message}</p>
              <p><strong>Status:</strong> {request.status || "Pending"}</p>
              {request.status === "Pending" && ( // Render buttons only if status is "Pending"
                <div style={styles.buttonContainer}>
                  <button
                    style={styles.acceptButton}
                    onClick={() => handleUpdateStatus(request.connectionRequestID, "Accepted")}
                  >
                    Accept
                  </button>
                  <button
                    style={styles.declineButton}
                    onClick={() => handleUpdateStatus(request.connectionRequestID, "Declined")}
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>



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
  requestsContainer: {
    marginTop: "60px",
    padding: "20px",
    backgroundColor: "#1e4620",
    borderRadius: "10px",
    color: "#fff",
  },
  requestCard: {
    backgroundColor: "#ffffff22",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px",
  },
  buttonContainer: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
  },
  acceptButton: {
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  declineButton: {
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
    color: "#ff4d4d",
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
