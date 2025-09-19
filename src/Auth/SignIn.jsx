// src/Auth/SignIn.jsx
import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig"; // ✅ Firebase config
import "./designs/SignIn.css";

import logo from "../assets/Group 44.png";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 👉 Replace this with YOUR Firebase user UID
  const ALLOWED_UID = "dbk8BizJO8e4uZqCHqVAOPAPE7q1";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Firebase login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("✅ Logged in:", user);

      // Allow only the specific UID
      if (user.uid !== ALLOWED_UID) {
        alert("❌ Access denied: Not authorized");
        return;
      }

      // ✅ Redirect after successful login
      navigate("/dashboard");
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  return (
    <div className="signin-page">
      {/* LEFT PANEL */}
      <section className="signin-left">
        <div className="left-inner">
          <div className="left-logo-wrap" aria-hidden>
            <img src={logo} alt="Inspire Me Now logo" className="left-logo" />
            <div className="left-brand">
              <div className="left-brand-line">Inspire</div>
              <div className="left-brand-line">Me Now</div>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="signin-right">
        <div className="signin-box">
          <div className="top-brand">
            <img src={logo} alt="logo" className="top-logo" />
            <div className="top-brand-text">
              <div className="top-brand-line">Inspire</div>
              <div className="top-brand-line">Me Now</div>
            </div>
          </div>

          <h4 className="form-heading">Sign In Admin Account</h4>
          <p className="form-subtext">
            Enter your credentials to access the admin dashboard
          </p>

          <Form className="signin-form" onSubmit={handleSubmit}>
            {/* Email */}
            <Form.Group controlId="formEmail">
              <div className="custom-input">
                <FaEnvelope className="input-icon-left" />
                <Form.Control
                  type="email"
                  placeholder="your.email@example.com"
                  className="custom-form-control"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </Form.Group>

            {/* Password */}
            <Form.Group controlId="formPassword">
              <div className="custom-input">
                <FaLock className="input-icon-left" />
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="custom-form-control"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {showPassword ? (
                  <FaEyeSlash
                    className="input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <FaEye
                    className="input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )}
              </div>
            </Form.Group>

            <Button type="submit" className="login-btn">
              Log In
            </Button>

            <div className="forgot-password">
              <Link to="/forget-password">Forget Password</Link>
            </div>
          </Form>
        </div>
      </section>
    </div>
  );
};

export default SignIn;
