const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tl',
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

// Register User
app.post('/api/register', (req, res) => {
    const {
        firstName,
        lastName,
        address,
        email,
        phoneNum,
        passvord,
        birthDate,
        hourly, // Only applicable for tutors
        role,   // "Student" or "Tutor"
    } = req.body;

    const table = role === 'Student' ? 'student' : 'tutor';

    const query = role === 'Student'
        ? `
            INSERT INTO ${table} (firstName, lastName, address, email, phoneNum, passvord, birthDate)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `
        : `
            INSERT INTO ${table} (firstName, lastName, hourly, address, email, phoneNum, passvord, birthDate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

    const params = role === 'Student'
        ? [firstName, lastName, address, email, phoneNum, passvord, birthDate]
        : [firstName, lastName, hourly, address, email, phoneNum, passvord, birthDate];

    db.query(query, params, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Email already exists' });
            }
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: `${role} registered successfully` });
    });
});

// Login User
app.post('/api/login', (req, res) => {
    const { email, passvord, role } = req.body;

    const table = role === 'Student' ? 'student' : 'tutor';

    const query = `SELECT * FROM ${table} WHERE email = ?`;

    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = results[0];

        // Directly compare the plain text passwords
        if (user.passvord !== passvord) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                id: role === 'Student' ? user.studentID : user.tutorID,
                role,
            },
            'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
        });
    });
});

// Get Tutor Profile Data
app.get('/api/tutor-profile', verifyToken, (req, res) => {
    const tutorID = req.user.id;

    const subjectQuery = `
        SELECT s.subjectID, s.name
        FROM subject s
    `;

    const selectedSubjectsQuery = `
        SELECT ts.subjectID
        FROM tutorsubject ts
        WHERE ts.tutorID = ?
    `;

    const hourlyRateQuery = `
        SELECT hourly
        FROM tutor
        WHERE tutorID = ?
    `;

    db.query(subjectQuery, (err, subjects) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch subjects' });

        db.query(selectedSubjectsQuery, [tutorID], (err, selectedSubjects) => {
            if (err) return res.status(500).json({ error: 'Failed to fetch selected subjects' });

            db.query(hourlyRateQuery, [tutorID], (err, hourlyRateResults) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch hourly rate' });

                const hourlyRate = hourlyRateResults[0]?.hourly || '';
                const selectedSubjectIDs = selectedSubjects.map((s) => s.subjectID);

                res.json({
                    subjects,
                    selectedSubjectIDs,
                    hourlyRate,
                });
            });
        });
    });
});

// Update Tutor Profile
app.post('/api/update-tutor-profile', verifyToken, (req, res) => {
    const tutorID = req.user.id;
    const { selectedSubjectIDs, hourlyRate } = req.body;

    const deleteSubjectsQuery = `
        DELETE FROM tutorsubject
        WHERE tutorID = ?
    `;

    const insertSubjectsQuery = `
        INSERT INTO tutorsubject (tutorID, subjectID)
        VALUES ?
    `;

    const updateHourlyQuery = `
        UPDATE tutor
        SET hourly = ?
        WHERE tutorID = ?
    `;

    db.query(deleteSubjectsQuery, [tutorID], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update subjects' });

        const insertValues = selectedSubjectIDs.map((subjectID) => [tutorID, subjectID]);
        db.query(insertSubjectsQuery, [insertValues], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to insert new subjects' });

            db.query(updateHourlyQuery, [hourlyRate, tutorID], (err) => {
                if (err) return res.status(500).json({ error: 'Failed to update hourly rate' });

                res.json({ message: 'Profile updated successfully' });
            });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/api/subjects', (req, res) => {
    const query = 'SELECT subjectID, name FROM subject';
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch subjects' });
      res.json({ subjects: results });
    });
});


app.post('/api/search-tutors', (req, res) => {
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
    query += ' AND s.subjectID = ?';
    params.push(subjectID);
  }

  if (hourlyRate) {
    query += ' AND t.hourly <= ?';
    params.push(hourlyRate);
  }

  if (onlyVerified) {
    query += ' AND t.address IS NOT NULL';
  }

  query += ' GROUP BY t.tutorID';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch tutors' });
    res.json({ tutors: results });
  });
});
