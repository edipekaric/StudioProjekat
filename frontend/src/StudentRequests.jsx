import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [paymentPopup, setPaymentPopup] = useState(false);
  const [currentTutor, setCurrentTutor] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    ccv: "",
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const response = await fetch("http://localhost:5000/api/student-requests", {
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

        // Check payment status for each request
        const requestsWithPaymentStatus = await Promise.all(
          data.requests.map(async (request) => {
            const paymentResponse = await fetch(
              "http://localhost:5000/api/check-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  tutorID: request.tutorID,
                  message: request.message,
                }),
              }
            );

            if (!paymentResponse.ok) {
              throw new Error("Failed to check payment status.");
            }

            const { paymentExists } = await paymentResponse.json();
            return { ...request, paymentMade: paymentExists };
          })
        );

        setRequests(requestsWithPaymentStatus);
      } catch (err) {
        setError(err.message || "An error occurred while fetching requests.");
      }
    };

    fetchRequests();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const openPaymentPopup = (request) => {
    setCurrentTutor(request);
    setPaymentPopup(true);
  };

  const closePaymentPopup = () => {
    setPaymentPopup(false);
    setCurrentTutor(null);
    setPaymentDetails({
      cardName: "",
      cardNumber: "",
      expiry: "",
      ccv: "",
    });
  };

  const handlePayment = async () => {
    if (!currentTutor || !currentTutor.tutorID) {
      alert("Tutor ID is missing. Cannot proceed with payment.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch("http://localhost:5000/api/make-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tutorID: currentTutor.tutorID,
          message: currentTutor.message,
          amount: 50,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to process payment.");
      }

      const data = await response.json();
      alert(data.message || "Payment made successfully!");

      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.connectionRequestID === currentTutor.connectionRequestID
            ? { ...req, paymentMade: true }
            : req
        )
      );

      closePaymentPopup();
    } catch (err) {
      alert(err.message || "Payment failed.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.logo} onClick={() => navigate("/landing-student")}>
        LOGO
      </div>

      <div style={styles.requestsContainer}>
        <h2>Your Connection Requests</h2>
        {error && <p style={styles.error}>{error}</p>}
        {requests.length === 0 ? (
          <p>No connection requests found.</p>
        ) : (
          requests.map((request) => (
            <div key={request.connectionRequestID} style={styles.requestCard}>
              <div style={styles.requestDetails}>
                <p>
                  <strong>Tutor Name:</strong> {request.tutorName}
                </p>
                <p>
                  <strong>Message:</strong> {request.message}
                </p>
                <p>
                  <strong>Status:</strong> {request.status || "Pending"}
                </p>
              </div>
              {request.status === "Accepted" &&
                (request.paymentMade ? (
                  <p style={styles.paymentMade}>Payment Made!</p>
                ) : (
                  <button
                    style={styles.paymentButton}
                    onClick={() => openPaymentPopup(request)}
                  >
                    Make Payment
                  </button>
                ))}
            </div>
          ))
        )}
      </div>

      <div style={styles.rightCorner}>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {paymentPopup && (
        <div style={styles.paymentPopup}>
          <div style={styles.popupContent}>
            <h3>Make Payment</h3>
            <p>
              Paying to: <strong>{currentTutor.tutorName}</strong>
            </p>
            <input
              type="text"
              placeholder="Name on Card"
              value={paymentDetails.cardName}
              onChange={(e) =>
                setPaymentDetails({ ...paymentDetails, cardName: e.target.value })
              }
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Card Number"
              value={paymentDetails.cardNumber}
              onChange={(e) =>
                setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })
              }
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Expiry Date (MM/YY)"
              value={paymentDetails.expiry}
              onChange={(e) =>
                setPaymentDetails({ ...paymentDetails, expiry: e.target.value })
              }
              style={styles.input}
            />
            <input
              type="text"
              placeholder="CCV"
              value={paymentDetails.ccv}
              onChange={(e) =>
                setPaymentDetails({ ...paymentDetails, ccv: e.target.value })
              }
              style={styles.input}
            />
            <button onClick={handlePayment} style={styles.sendButton}>
              Confirm Payment
            </button>
            <button style={styles.closeButton} onClick={closePaymentPopup}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#013220",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    padding: "20px",
  },
  logo: {
    position: "absolute",
    top: "10px",
    left: "10px",
    fontSize: "1.5rem",
    color: "#fff",
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
    position: "relative",
    backgroundColor: "#ffffff22",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  requestDetails: {
    flex: "1",
  },
  error: {
    color: "#ff4d4d",
  },
  rightCorner: {
    position: "absolute",
    top: "10px",
    right: "10px",
    display: "flex",
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
  paymentButton: {
    backgroundColor: "#4caf50",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginLeft: "10px",
  },
  paymentMade: {
    color: "#4caf50",
    marginLeft: "auto",
  },
  paymentPopup: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    color: "#000",
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
  },
  input: {
    width: "95%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
};

export default StudentRequests;
