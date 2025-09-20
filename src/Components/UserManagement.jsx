import React, { useState, useEffect } from "react";
import "./designs/UserManagement.css";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

const UserManagement = () => {
  const [entries, setEntries] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const formatTimestamp = (ts) => {
    if (!ts) return "-";
    if (typeof ts === "string") return ts;
    if (ts.seconds) {
      const date = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
      return date.toLocaleString();
    }
    return "-";
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

  // Pagination logic
  const totalPages = Math.ceil(entries.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentEntries = entries.slice(indexOfFirst, indexOfLast);

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
      <div className="page-header mb-2 text-center text-md-start">
        <h3 className="mb-0">User Management</h3>
        <p>View and manage anonymized user data</p>
      </div>

      <div className="user-data-card mt-4">
        <div className="user-data-header">
          <h6>User Data</h6>
        </div>

        <div className="table-responsive">
          <table className="table user-data-table">
            <thead>
              <tr>
                <th>ID</th>
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
                    <td>{entry.id}</td>
                    <td>{entry.deviceId}</td>
                    <td>{entry.lastSeen}</td>
                    <td>{entry.createdAt}</td>
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
                  <td colSpan="5" className="text-center">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {entries.length > itemsPerPage && (
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
    </div>
  );
};

export default UserManagement;
