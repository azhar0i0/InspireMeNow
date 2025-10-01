import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaFolder } from "react-icons/fa";
import "./designs/Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    // Clear any auth tokens or session storage if you use them
    localStorage.clear();
    sessionStorage.clear();
    navigate("/"); // Redirect to sign-in page ("/")
  };

  return (
    <div className={`sidebar d-flex flex-column p-3 ${isOpen ? "open" : ""}`}>
      {/* Close button (mobile only) */}
      <button className="close-btn d-md-none" onClick={toggleSidebar}>
        ✖
      </button>

      <h4 className="sidebar-title">DASHBOARD</h4>
      <hr />

      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            onClick={toggleSidebar}
          >
            <FaTachometerAlt className="me-2" /> Dashboard
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink
            to="/dashboard/user-management"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            onClick={toggleSidebar}
          >
            <FaUsers className="me-2" /> User Management
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink
            to="/dashboard/content-management"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            onClick={toggleSidebar}
          >
            <FaFolder className="me-2" /> Content Management
          </NavLink>
        </li>
      </ul>

      {/* User info with hover logout */}
      <div
        className="user-info mt-auto d-flex justify-items-center align-items-center position-relative"
        onMouseEnter={() => setShowLogout(true)}
        onMouseLeave={() => setShowLogout(false)}
      >
        <div>
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* Logout dropdown */}
        {showLogout && (
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
