// src/Auth/SignIn.jsx
import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";
import "./designs/SignIn.css";
import logo from "../assets/Group 44.png";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  // 👉 Replace this with YOUR Firebase user UID
  const ALLOWED_UID = "dbk8BizJO8e4uZqCHqVAOPAPE7q1";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.uid !== ALLOWED_UID) {
        alert("❌ Access denied: Not authorized");
        return;
      }
      window.location.href = "/dashboard"; // redirect
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`✅ Reset link sent to ${email}`);
      setShowForgot(false); // go back to login after success
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

          {!showForgot ? (
            <>
              <h4 className="form-heading">Sign In Admin Account</h4>
              <p className="form-subtext">Enter your credentials to access the admin dashboard</p>

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

                <Button type="submit" className="login-btn">Log In</Button>

                <div className="forgot-password">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setShowForgot(true)}
                  >
                    Forget Password?
                  </button>
                </div>
              </Form>
            </>
          ) : (
            <>
              <h4 className="form-heading">Reset Password</h4>
              <p className="form-subtext">Enter your email to receive a reset link</p>

              <Form className="signin-form" onSubmit={handlePasswordReset}>
                <Form.Group controlId="formResetEmail">
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

                <Button type="submit" className="login-btn">Send Reset Link</Button>

                <div className="forgot-password">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setShowForgot(false)}
                  >
                    Back to Login
                  </button>
                </div>
              </Form>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default SignIn;
