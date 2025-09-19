import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./designs/Layout.css";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout d-flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div
        className={`main-content flex-grow-1 ${sidebarOpen ? "sidebar-open" : ""}`}
      >
        {/* Topbar with Hamburger */}
        <div className="topbar d-md-none">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h5 className="m-0">Dashboard</h5>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
