// src/Components/NotFound.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect after 1 seconds
    const timer = setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404 - Page Not Found</h1>
      <p style={styles.text}>Redirecting you to Dashboard...</p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    textAlign: "center",
    backgroundColor: "#f8f9fa",
    color: "#333",
  },
  title: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  text: {
    fontSize: "1.2rem",
    color: "#666",
  },
};

export default NotFound;
