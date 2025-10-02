// src/Components/ContentManagement.jsx
import React, { useState, useEffect } from "react";
import { Button, ToastContainer, Toast } from "react-bootstrap";
import "./designs/ContentManagement.css";
import { FaExclamationTriangle } from "react-icons/fa";
import AddNewEntry from "./Parts/AddNewEntry";
import {
  collection,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

const MOODS = [
  "Lonely",
  "Heartbroken",
  "Lost",
  "Anxious",
  "Overwhelmed",
  "Unmotivated",
  "Guilty",
  "Insecure",
  "Empty",
  "Stresses",
  "Angry",
  "Betrayed",
];

const ALL_CATEGORIES = [
  "affirmation",
  "miniexercise",
  "peptalk",
  "quickreset",
  "reflections",
  "voicejourney",
  "voice",
];

const ContentManagement = () => {
  const [entries, setEntries] = useState([]);
  const [versionsList, setVersionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [entryName, setEntryName] = useState("");
  const [makeLive, setMakeLive] = useState(false);
  const [selectedMood, setSelectedMood] = useState("All moods");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showToast, setShowToast] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(entries.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPaginatedEntries = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return entries.slice(indexOfFirstItem, indexOfLastItem);
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

  // --- Real-time listener ---
  useEffect(() => {
    let mounted = true;
    setEntries([]);
    setLoading(true);

    const moodsToFetch = selectedMood === "All moods" ? MOODS : [selectedMood];
    const unsubscribers = [];

    moodsToFetch.forEach((mood) => {
      const versionsRef = collection(db, "moods", mood, "versions");
      const q = query(versionsRef, orderBy("createdAt", "desc"));

      const unsub = onSnapshot(
        q,
        async (versionsSnap) => {
          try {
            const moodEntries = await Promise.all(
              versionsSnap.docs.map(async (versionDoc) => {
                const versionData = versionDoc.data() || {};
                const createdAtSecs =
                  versionData?.createdAt?.seconds ??
                  (versionData?.createdAt
                    ? Math.floor(new Date(versionData.createdAt).getTime() / 1000)
                    : 0);

                const versionDocRef = doc(db, "moods", mood, "versions", versionDoc.id);
                const categoriesSnap = await getDocs(collection(versionDocRef, "categories"));
                const categoriesData = categoriesSnap.docs.map((c) => ({
                  categoryName: c.id,
                  ...c.data(),
                }));

                return {
                  mood,
                  versionId: versionDoc.id,
                  versionData,
                  categories: categoriesData.length
                    ? categoriesData
                    : [{ categoryName: "No categories", heading: "", text: "", voice: null }],
                  createdAtSecs,
                };
              })
            );

            if (!mounted) return;

            setEntries((prev) => {
              if (selectedMood === "All moods") {
                const withoutThisMood = prev.filter((e) => e.mood !== mood);
                const combined = [...withoutThisMood, ...moodEntries];
                combined.sort((a, b) => (b.createdAtSecs || 0) - (a.createdAtSecs || 0));
                return combined;
              }
              return [...moodEntries].sort((a, b) => (b.createdAtSecs || 0) - (a.createdAtSecs || 0));
            });

            if (selectedMood !== "All moods" && mood === selectedMood) {
              setVersionsList(moodEntries.map((e) => e.versionId));
            } else if (selectedMood === "All moods") {
              setVersionsList([]);
            }

            setLoading(false);
          } catch (err) {
            console.error("Real-time listener error for mood", mood, err);
            if (!mounted) return;
            setToastType("danger");
            setToastMsg("⚠ Failed to fetch entries in real-time.");
            setShowToast(true);
            setLoading(false);
          }
        },
        (err) => {
          console.error("onSnapshot error for mood", mood, err);
          if (!mounted) return;
          setToastType("danger");
          setToastMsg("⚠ Real-time subscription error.");
          setShowToast(true);
          setLoading(false);
        }
      );

      unsubscribers.push(unsub);
    });

    return () => {
      mounted = false;
      unsubscribers.forEach((u) => u());
    };
  }, [selectedMood]);

  const handleEdit = (versionId, mood, categoryName) => {
    const entry = entries.find((e) => e.versionId === versionId && e.mood === mood);
    if (!entry) return;

    const editing = {
      mood,
      versionId,
      versionData: entry.versionData,
      entryName: entry.versionData.entryName || `${mood}-${versionId}`,
      categories: entry.categories,
      categoryName: categoryName || entry.categories[0]?.categoryName,
    };

    setEditingEntry(editing);
    setEntryName(editing.entryName || "");
    setMakeLive(!!editing.versionData?.live);
    setShowAddModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { versionId, mood } = deleteTarget;
    try {
      setLoading(true);
      const categoriesRef = collection(db, "moods", mood, "versions", versionId, "categories");
      const categoriesSnap = await getDocs(categoriesRef);
      for (const catDoc of categoriesSnap.docs) {
        await deleteDoc(doc(db, "moods", mood, "versions", versionId, "categories", catDoc.id));
      }
      await deleteDoc(doc(db, "moods", mood, "versions", versionId));

      setEntries((prev) => prev.filter((e) => !(e.versionId === versionId && e.mood === mood)));
      setShowDeleteModal(false);
      setDeleteTarget(null);

      setToastType("success");
      setToastMsg("✅ Version deleted successfully!");
      setShowToast(true);
    } catch (err) {
      console.error("Error deleting version:", err);
      setToastType("danger");
      setToastMsg("❌ Failed to delete version.");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-management p-3">
      {/* Toast with auto hide */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          bg={toastType}
          autohide
          delay={3500} // 3.5 seconds
        >
          <Toast.Body className="text-white">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="page-header mb-2">
        <h3 className="mb-0">Content Management</h3>
        <p className="sub-text">To Add or Edit the entries select that specific mood</p>
      </div>

      <h5 className="mt-4">Select Mood</h5>
      <div className="d-flex gap-3 mb-3 select-mood-row">
        <select
          className="form-select"
          value={selectedMood}
          onChange={(e) => {
            setSelectedMood(e.target.value);
            setCurrentPage(1);
          }}
          style={{ height: "36px" }}
        >
          <option>All moods</option>
          {MOODS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        {selectedMood !== "All moods" && (
          <Button
            className="btn btn-primary"
            onClick={() => {
              setEditingEntry(null);
              setEntryName("");
              setMakeLive(false);
              setShowAddModal(true);
            }}
          >
            + Add New Entry
          </Button>
        )}
      </div>

      <div className="card custom-card">
        <div className="card-header custom-card-header">Content Versions</div>
        <table className="table mb-0 custom-table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Mood</th>
              <th>Live Status</th>
              <th>Categories</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  <div className="loader"><div></div><div></div><div></div><div></div><div></div></div>
                  <p style={{ color: "orange", marginTop: "0.5rem" }}>Loading versions...</p>
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">No versions found.</td>
              </tr>
            ) : (
              getPaginatedEntries().map((e) => {
                const categoryNames = e.categories.map((c) => c.categoryName);
                const isAllCategories = ALL_CATEGORIES.every((cat) => categoryNames.includes(cat));
                return (
                  <tr key={`${e.mood}-${e.versionId}`}>
                    <td>{e.versionId}</td>
                    <td>{e.mood}</td>
                    <td>
                      <span className={`badge ${e.versionData?.live ? "bg-success" : "bg-secondary"}`}>
                        {e.versionData?.live ? "Live" : "Inactive"}
                      </span>
                    </td>
                    <td>{isAllCategories ? "All Tabs" : "All Tabs"}</td>
                    <td>
                      {selectedMood !== "All moods" && (
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-2"
                          onClick={() =>
                            handleEdit(e.versionId, e.mood, e.categories[0]?.categoryName)
                          }
                        >
                          ✎
                        </Button>
                      )}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setDeleteTarget({ versionId: e.versionId, mood: e.mood });
                          setShowDeleteModal(true);
                        }}
                      >
                        🗑
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination with info */}
      {entries.length > itemsPerPage && (
        <div className="pagination-wrapper d-flex justify-content-between align-items-center mt-2">
          <div className="text-muted small">
            Showing {getPaginatedEntries().length} out of {entries.length} entries
          </div>
          <div className="pagination-container">
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
        </div>
      )}

      <AddNewEntry
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        showPublishModal={showPublishModal}
        setShowPublishModal={setShowPublishModal}
        editingEntry={editingEntry}
        entryName={entryName}
        setEntryName={setEntryName}
        makeLive={makeLive}
        setMakeLive={setMakeLive}
        selectedMood={selectedMood}
        fetchEntries={() => {}}
        existingVersions={versionsList}
      />

      {showDeleteModal && (
        <>
          <div className="modal-backdrop-custom" onClick={() => setShowDeleteModal(false)}></div>
          <div className="modal-custom">
            <div className="modal-content delete-modal">
              <div className="modal-body delete-body text-center">
                <FaExclamationTriangle className="delete-icon mb-3" />
                <h5 className="delete-title">Confirm Deletion</h5>
                <div className="delete-box">
                  <p className="mb-0">
                    You are about to delete <b>'{deleteTarget?.versionId}'</b>.
                    <br />
                    This will remove this version from all user experiences.
                  </p>
                  <p className="delete-warning mb-0">This action cannot be undone.</p>
                </div>
              </div>
              <div className="modal-footer-custom">
                <Button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button className="delete-btn" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContentManagement;
