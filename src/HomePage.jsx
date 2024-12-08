import React from "react";

const HomePage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to TutorLink</h1>
      <p style={styles.subtitle}>By Edi Pekaric</p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Ensure it spans the entire width
    height: "100vh", // Full viewport height
    backgroundColor: "#013220", // Dark green theme
    margin: 0,
    padding: 0,
    color: "#ffffff", // White text for contrast
    boxSizing: "border-box", // Include padding in height/width calculations
  },
  title: {
    fontSize: "4rem", // Large, readable font size
    margin: 0,
  },
  subtitle: {
    fontSize: "2rem", // Slightly smaller for the subtitle
    margin: "20px 0 0 0", // Space between title and subtitle
  },
};

export default HomePage;
