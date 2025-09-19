// src/Components/UserManagement.jsx
import React, { useState, useEffect } from "react";
import "./designs/UserManagement.css";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

const UserManagement = () => {
  const [entries, setEntries] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 8;

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
        ) // exclude aggregates
        .map((docSnap, index) => {
          const userData = docSnap.data();
          return {
            id: index + 1,
            deviceId: docSnap.id,
            lastSeen: formatTimestamp(userData.lastSeen),
            createdAt: formatTimestamp(userData.createdAt),
            status: userData.Status ?? true, // default true if missing
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
  const totalPages = Math.ceil(entries.length / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = entries.slice(indexOfFirst, indexOfLast);

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) setCurrentPage(pageNum);
  };
  const goToNextGroup = () => {
    if (currentPage + 3 <= totalPages) setCurrentPage(currentPage + 3);
    else if (currentPage < totalPages) setCurrentPage(totalPages);
  };
  const goToPrevGroup = () => {
    if (currentPage - 3 >= 1) setCurrentPage(currentPage - 3);
    else if (currentPage > 1) setCurrentPage(1);
  };

  const pageNumbers = [];
  let start = Math.max(1, currentPage - 1);
  let end = Math.min(totalPages, currentPage + 1);
  if (currentPage === 1) end = Math.min(totalPages, 3);
  else if (currentPage === totalPages) start = Math.max(1, totalPages - 2);
  for (let i = start; i <= end; i++) pageNumbers.push(i);

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
                        className={`status-btn ${
                          entry.status ? "active" : "inactive"
                        }`}
                        onClick={() =>
                          handleToggleStatus(entry.deviceId, entry.status)
                        }
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
        <div className="user-data-footer d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <span className="text-center text-md-start">
            Showing {currentEntries.length} of {entries.length} entries
          </span>
          <ul className="pagination custom-pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={goToPrevGroup}>
                Previous
              </button>
            </li>

            {pageNumbers.map((num) => (
              <li
                key={num}
                className={`page-item ${currentPage === num ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => goToPage(num)}>
                  {num}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button className="page-link" onClick={goToNextGroup}>
                Next
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
