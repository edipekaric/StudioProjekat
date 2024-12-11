const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "tl",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  jwt.verify(token, "your_jwt_secret", (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    console.log("Decoded token:", decoded); // Debugging
    req.user = decoded; // Attach decoded data to request object
    next();
  });
};

// Register User
app.post("/api/register", (req, res) => {
  const {
    firstName,
    lastName,
    address,
    email,
    phoneNum,
    passvord,
    birthDate,
    hourly, // Only applicable for tutors
    role, // "Student" or "Tutor"
  } = req.body;

  const table = role === "Student" ? "student" : "tutor";

  const query =
    role === "Student"
      ? `
            INSERT INTO ${table} (firstName, lastName, address, email, phoneNum, passvord, birthDate)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `
      : `
            INSERT INTO ${table} (firstName, lastName, hourly, address, email, phoneNum, passvord, birthDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

  const params =
    role === "Student"
      ? [firstName, lastName, address, email, phoneNum, passvord, birthDate]
      : [firstName, lastName, hourly, address, email, phoneNum, passvord, birthDate];

  db.query(query, params, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Email already exists" });
      }
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: `${role} registered successfully` });
  });
});

// Login User
app.post("/api/login", (req, res) => {
  const { email, passvord, role } = req.body;

  const table = role === "Student" ? "student" : "tutor";

  const query = `SELECT * FROM ${table} WHERE email = ?`;

  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });

    const user = results[0];

    // Directly compare the plain text passwords
    if (user.passvord !== passvord) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: role === "Student" ? user.studentID : user.tutorID,
        role,
      },
      "your_jwt_secret",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
    });
  });
});

// Endpoint to handle connection requests
app.post("/api/request-connection", verifyToken, (req, res) => {
  const studentID = req.user.id; // Student ID from the token
  const { tutorID, message } = req.body;

  // Validate inputs
  if (!tutorID || !message) {
    return res.status(400).json({ error: "Tutor ID and message are required" });
  }

  const query = `
        INSERT INTO connectionrequest (studentID, tutorID, message, status)
        VALUES (?, ?, ?, ?)
    `;

  // Manually set the status to 'Pending'
  db.query(query, [studentID, tutorID, message, "Pending"], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to create connection request" });
    }
    res.status(201).json({ message: "Connection request sent successfully!" });
  });
});

// Fetch all subjects
app.get("/api/subjects", (req, res) => {
  const query = "SELECT subjectID, name FROM subject";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch subjects" });
    res.json({ subjects: results });
  });
});

// Fetch tutors based on search criteria
app.post("/api/search-tutors", (req, res) => {
  const { subjectID, hourlyRate, onlyVerified } = req.body;

  let query = `
    SELECT t.tutorID, t.firstName, t.lastName, t.hourly AS hourlyRate, GROUP_CONCAT(s.name) AS subjects
    FROM tutor t
    JOIN tutorsubject ts ON t.tutorID = ts.tutorID
    JOIN subject s ON ts.subjectID = s.subjectID
    WHERE 1=1
  `;

  const params = [];

  if (subjectID) {
    query += " AND s.subjectID = ?";
    params.push(subjectID);
  }

  if (hourlyRate) {
    query += " AND t.hourly <= ?";
    params.push(hourlyRate);
  }

  if (onlyVerified) {
    query += " AND t.address IS NOT NULL";
  }

  query += " GROUP BY t.tutorID";

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch tutors" });
    res.json({ tutors: results });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Endpoint to handle connection requests
app.post('/api/request-connection', verifyToken, (req, res) => {
    const studentID = req.user.id; // Student ID from the token
    const { tutorID, message } = req.body;

    // Validate inputs
    if (!tutorID || !message) {
        return res.status(400).json({ error: 'Tutor ID and message are required' });
    }

    const query = `
        INSERT INTO connectionrequest (studentID, tutorID, message, status)
        VALUES (?, ?, ?, ?)
    `;

    // Manually set the status to 'Pending'
    db.query(query, [studentID, tutorID, message, 'Pending'], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to create connection request' });
        }
        res.status(201).json({ message: 'Connection request sent successfully!' });
    });
});

// Endpoint to fetch connection requests for a tutor
app.get("/api/tutor-requests", verifyToken, (req, res) => {
    const tutorID = req.user.id;
  
    const query = `
      SELECT cr.connectionRequestID, cr.message, cr.status, CONCAT(s.firstName, ' ', s.lastName) AS studentName
      FROM connectionrequest cr
      JOIN student s ON cr.studentID = s.studentID
      WHERE cr.tutorID = ?
    `;
  
    db.query(query, [tutorID], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to fetch connection requests." });
      }
      res.status(200).json({ requests: results });
    });
  });

  // Endpoint to update the status of a connection request
app.post("/api/update-request-status", verifyToken, (req, res) => {
  const { connectionRequestID, status } = req.body;

  if (!connectionRequestID || !status) {
    return res.status(400).json({ error: "Request ID and status are required." });
  }

  const query = `
    UPDATE connectionrequest
    SET status = ?
    WHERE connectionRequestID = ?
  `;

  db.query(query, [status, connectionRequestID], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to update request status." });
    }
    res.status(200).json({ message: `Request status updated to ${status}.` });
  });
});

app.post("/api/update-request-status", verifyToken, (req, res) => {
  const { connectionRequestID, status } = req.body;

  if (!connectionRequestID || !status) {
    return res.status(400).json({ error: "ConnectionRequestID and status are required." });
  }

  const query = `
    UPDATE connectionrequest
    SET status = ?
    WHERE connectionRequestID = ?
  `;

  db.query(query, [status, connectionRequestID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to update request status." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Connection request not found." });
    }

    res.status(200).json({ message: `Request ${status.toLowerCase()} successfully!` });
  });
});

// Valja
// Endpoint to fetch connection requests for a student
app.get("/api/student-requests", verifyToken, (req, res) => {
  const studentID = req.user.id; // Student ID from the token

  const query = `
    SELECT 
      cr.connectionRequestID, 
      cr.message, 
      cr.status, 
      t.tutorID, 
      CONCAT(t.firstName, ' ', t.lastName) AS tutorName
    FROM connectionrequest cr
    JOIN tutor t ON cr.tutorID = t.tutorID
    WHERE cr.studentID = ?
  `;

  db.query(query, [studentID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch connection requests." });
    }
    res.status(200).json({ requests: results });
  });
});

// Fetch tutor profile
app.get("/api/tutor-profile", verifyToken, (req, res) => {
  const tutorID = req.user.id; // Tutor ID from the token

  const queryTutor = `
    SELECT hourly AS hourlyRate
    FROM tutor
    WHERE tutorID = ?
  `;

  const querySubjects = `
    SELECT subjectID, name
    FROM subject
  `;

  db.query(queryTutor, [tutorID], (err, tutorResults) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch tutor profile." });
    }

    db.query(querySubjects, (err, subjectResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to fetch subjects." });
      }

      res.status(200).json({
        hourlyRate: tutorResults[0]?.hourlyRate || "",
        subjects: subjectResults,
        selectedSubjectIDs: [],
      });
    });
  });
});

app.post("/api/update-tutor-profile", verifyToken, (req, res) => {
  const tutorID = req.user.id; // Tutor ID from the token
  const { selectedSubjectIDs, hourlyRate } = req.body;

  if (!Array.isArray(selectedSubjectIDs) || !hourlyRate) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  // Update hourly rate
  const updateTutorQuery = `
    UPDATE tutor
    SET hourly = ?
    WHERE tutorID = ?
  `;

  // Clear existing subjects and add new ones
  const deleteSubjectsQuery = `
    DELETE FROM tutorsubject
    WHERE tutorID = ?
  `;

  const insertSubjectsQuery = `
    INSERT INTO tutorsubject (tutorID, subjectID)
    VALUES (?, ?)
  `;

  db.query(updateTutorQuery, [hourlyRate, tutorID], (err) => {
    if (err) {
      console.error("Failed to update tutor:", err);
      return res.status(500).json({ error: "Failed to update tutor details" });
    }

    db.query(deleteSubjectsQuery, [tutorID], (err) => {
      if (err) {
        console.error("Failed to delete tutor subjects:", err);
        return res.status(500).json({ error: "Failed to update subjects" });
      }

      const insertTasks = selectedSubjectIDs.map((subjectID) =>
        new Promise((resolve, reject) => {
          db.query(insertSubjectsQuery, [tutorID, subjectID], (err) => {
            if (err) reject(err);
            else resolve();
          });
        })
      );

      Promise.all(insertTasks)
        .then(() => res.status(200).json({ message: "Profile updated successfully" }))
        .catch((err) => {
          console.error("Failed to insert subjects:", err);
          res.status(500).json({ error: "Failed to update subjects" });
        });
    });
  });
});

app.post("/api/make-payment", verifyToken, (req, res) => {
  const studentID = req.user.id; // Extracted from the JWT token
  const { tutorID, amount, message } = req.body;

  if (!tutorID || !amount || !message) {
    return res.status(400).json({ error: "Tutor ID, message, and amount are required." });
  }

  // Get the connectionRequestID by matching studentID, tutorID, and message
  const getConnectionRequestQuery = `
    SELECT connectionRequestID 
    FROM connectionrequest 
    WHERE studentID = ? AND tutorID = ? AND message = ?
  `;

  db.query(getConnectionRequestQuery, [studentID, tutorID, message], (err, results) => {
    if (err) {
      console.error("Error fetching connection request:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Connection request not found." });
    }

    const connectionRequestID = results[0].connectionRequestID;

    // Insert the payment into the payment table
    const insertPaymentQuery = `
      INSERT INTO payment (studentID, tutorID, connectionRequestID, amount)
      VALUES (?, ?, ?, ?)
    `;
    db.query(insertPaymentQuery, [studentID, tutorID, connectionRequestID, amount], (err) => {
      if (err) {
        console.error("Error inserting payment:", err);
        return res.status(500).json({ error: "Failed to process payment." });
      }

      res.status(201).json({ message: "Payment made successfully!" });
    });
  });
});

app.post("/api/check-payment", verifyToken, (req, res) => {
  const studentID = req.user.id; // Extracted from JWT
  const { tutorID, message } = req.body;

  if (!tutorID || !message) {
    return res.status(400).json({ error: "Tutor ID and message are required." });
  }

  const query = `
    SELECT * 
    FROM payment p
    JOIN connectionrequest cr ON p.connectionRequestID = cr.connectionRequestID
    WHERE p.studentID = ? AND p.tutorID = ? AND cr.message = ?
  `;

  db.query(query, [studentID, tutorID, message], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    if (results.length > 0) {
      return res.status(200).json({ paymentExists: true });
    }

    res.status(200).json({ paymentExists: false });
  });
});