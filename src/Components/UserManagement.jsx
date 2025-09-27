import React, { useState, useEffect } from "react";
import "./designs/UserManagement.css";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

const UserManagement = () => {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const formatTimestamp = (ts) => {
    if (!ts) return null;
    if (typeof ts === "string") return new Date(ts);
    if (ts.seconds) {
      return ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    }
    return null;
  };

  // Real-time fetch
  useEffect(() => {
    const usersCollection = collection(db, "users");
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const data = snapshot.docs
        .filter(
          (docSnap) =>
            docSnap.id !== "noofusers" && docSnap.id !== "totalnumberofusers"
        )
        .map((docSnap, index) => {
          const userData = docSnap.data();
          return {
            id: index + 1,
            deviceId: docSnap.id,
            lastSeen: formatTimestamp(userData.lastSeen),
            createdAt: formatTimestamp(userData.createdAt),
            status: userData.Status ?? true,
          };
        });
      setEntries(data);
    });
    return () => unsubscribe();
  }, []);

  // Toggle Status
  const handleToggleStatus = async (deviceId, currentStatus) => {
    try {
      const userRef = doc(db, "users", deviceId);
      await updateDoc(userRef, { Status: !currentStatus });
      console.log(
        `User ${deviceId} status updated to ${!currentStatus ? "Active" : "Inactive"}`
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update user status.");
    }
  };

  // Filtering
  const now = new Date();
  const filteredEntries = entries.filter((user) => {
    if (filter === "new") {
      return user.createdAt && now - user.createdAt <= 24 * 60 * 60 * 1000;
    }
    if (filter === "recent") {
      return user.lastSeen && now - user.lastSeen <= 24 * 60 * 60 * 1000;
    }
    if (filter === "active") {
      return user.status === true;
    }
    if (filter === "inactive") {
      return user.status === false;
    }
    return true; // all
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getVisiblePages = () => {
    const pagesToShow = 3;
    let start = Math.max(currentPage - 1, 1);
    let end = start + pagesToShow - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - pagesToShow + 1, 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="user-management">
      {/* Header with Dropdown */}
      <div className="page-header mb-2 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="mb-0">User Management</h3>
          <p>View and manage anonymized user data</p>
        </div>

        <div className="filter-dropdown">
          <select
            className="custom-select"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Users</option>
            <option value="new">New Users (last 24h)</option>
            <option value="recent">Recent Users (last seen 24h)</option>
            <option value="active">Active Users</option>
            <option value="inactive">Inactive Users</option>
          </select>
          <span className="dropdown-icon">▼</span>
        </div>
      </div>

      {/* User Table */}
      <div className="user-data-card mt-4">
        <div className="user-data-header">
          <h6>User Data</h6>
        </div>

        <div className="table-responsive">
          <table className="table user-data-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>DeviceID</th>
                <th>LastSeen</th>
                <th>CreatedAt</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.length > 0 ? (
                currentEntries.map((entry) => (
                  <tr key={entry.deviceId}>
                    <td><p>{entry.id}</p></td>
                    <td>{entry.deviceId}</td>
                    <td>{entry.lastSeen ? entry.lastSeen.toLocaleString() : "-"}</td>
                    <td>{entry.createdAt ? entry.createdAt.toLocaleString() : "-"}</td>
                    <td>
                      <button
                        className={`status-btn ${entry.status ? "active" : "inactive"}`}
                        onClick={() => handleToggleStatus(entry.deviceId, entry.status)}
                      >
                        {entry.status ? "Active" : "Inactive"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredEntries.length > itemsPerPage && (
        <div className="pagination-container mt-3">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            ‹ Prev
          </button>

          {getVisiblePages().map((p) => (
            <button
              key={p}
              className={`pagination-btn ${currentPage === p ? "active" : ""}`}
              onClick={() => handlePageChange(p)}
            >
              {p}
            </button>
          ))}

          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
