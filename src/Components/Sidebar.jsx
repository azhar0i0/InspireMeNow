// Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaFolder, FaSignOutAlt } from "react-icons/fa";
import "./designs/Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  // 1. Initialize the navigate function
  const navigate = useNavigate();

  // 2. Updated handleLogout function to include actual logout logic and redirection
  const handleLogout = () => {
    // 💡 Step 1: Perform the actual logout (e.g., clear tokens/session)
    console.log("User logged out! Clearing session...");
    // localStorage.removeItem('authToken'); // Example: clear an auth token
    // sessionStorage.clear();             // Example: clear session storage

    // 💡 Step 2: Redirect the user to the root path '/' (login page or homepage)
    navigate('/');
  };

  return (
    <div className={`sidebar d-flex flex-column p-3 ${isOpen ? "open" : ""}`}>
      {/* Close button (mobile only) */}
      <button className="close-btn d-md-none" onClick={toggleSidebar}>
        ✖
      </button>

      {/* Main Navigation and Title */}
      <div className="sidebar-content flex-grow-1">
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
          <li className="nav-item mb-2">
            <NavLink
              to="/dashboard/meditation"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              onClick={toggleSidebar}
            >
              <FaFolder className="me-2" /> Meditation
            </NavLink>
          </li>
        </ul>
      </div>

      {/* --- Logout Button at the Bottom --- */}
      <div className="sidebar-footer">
        <hr />
        <button
          className="nav-link logout-btn w-100"
          onClick={() => {
            handleLogout();
            toggleSidebar(); // Close sidebar after clicking logout (for mobile)
          }}
        >
          <FaSignOutAlt className="me-2" /> Logout
        </button>
      </div>
      {/* ------------------------------------- */}
    </div>
  );
};

export default Sidebar;