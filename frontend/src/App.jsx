import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import LandingTutor from "./LandingTutor";
import TutorProfile from "./TutorProfile";
import LandingStudent from "./LandingStudent";
import Register from "./Register";
import StudentRequests from "./StudentRequests";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/landing-tutor" element={<LandingTutor />} />
        <Route path="/tutor-profile" element={<TutorProfile />} />
        <Route path="/landing-student" element={<LandingStudent />} />
        <Route path="/student-requests" element={<StudentRequests />} />
      </Routes>
    </Router>
  );
};

export default App;
