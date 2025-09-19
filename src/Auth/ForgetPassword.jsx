import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth"; // 👈 added
import "./designs/ForgetPassword.css";

import logo from "../assets/Group 44.png";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Reset link sent! Check your email.");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="forget-page">
      {/* LEFT PANEL */}
      <section className="forget-left">
        <div className="left-inner">
          <img src={logo} alt="Inspire logo" className="left-logo" />
          <div className="left-brand">
            <div className="left-brand-line">Inspire</div>
            <div className="left-brand-line">Me Now</div>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="forget-right">
        <div className="forget-box">
          <div className="top-brand">
            <img src={logo} alt="logo" className="top-logo" />
            <h2 className="brand-name">
              Inspire <br /> Me Now
            </h2>
          </div>

          <h4 className="form-heading">Forgot Password</h4>
          <p className="form-subtext">
            Enter your registered email to reset your password
          </p>

          <Form className="forget-form" onSubmit={handleReset}>
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

            <Button type="submit" className="login-btn w-100">
              Send Reset Link
            </Button>

            <div className="back-to-login">
              <Link to="/">Back to Sign In</Link>
            </div>
          </Form>
        </div>
      </section>
    </div>
  );
};

export default ForgetPassword;
