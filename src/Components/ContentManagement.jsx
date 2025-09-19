// src/Components/ContentManagement.jsx
import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
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
  const [error, setError] = useState("");

  // --- Real-time listener (versions per mood). Categories are fetched once per version via getDocs.
  useEffect(() => {
    let mounted = true;
    setEntries([]);
    setLoading(true);
    setError("");

    const moodsToFetch = selectedMood === "All moods" ? MOODS : [selectedMood];
    const unsubscribers = [];

    moodsToFetch.forEach((mood) => {
      const versionsRef = collection(db, "moods", mood, "versions");
      const q = query(versionsRef, orderBy("createdAt", "desc"));

      const unsub = onSnapshot(
        q,
        async (versionsSnap) => {
          try {
            // Build entries for this mood
            const moodEntries = await Promise.all(
              versionsSnap.docs.map(async (versionDoc) => {
                const versionData = versionDoc.data() || {};
                // normalize createdAt to seconds for sorting (works whether timestamp object or string)
                const createdAtSecs =
                  versionData?.createdAt?.seconds ??
                  (versionData?.createdAt ? Math.floor(new Date(versionData.createdAt).getTime() / 1000) : 0);

                const versionDocRef = doc(db, "moods", mood, "versions", versionDoc.id);
                const categoriesSnap = await getDocs(collection(versionDocRef, "categories"));
                const categoriesData = categoriesSnap.docs.map((c) => ({ categoryName: c.id, ...c.data() }));

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
              // If we're viewing all moods, merge this mood's entries into prev (replace any old entries for same mood)
              if (selectedMood === "All moods") {
                const withoutThisMood = prev.filter((e) => e.mood !== mood);
                const combined = [...withoutThisMood, ...moodEntries];
                combined.sort((a, b) => (b.createdAtSecs || 0) - (a.createdAtSecs || 0));
                return combined;
              }

              // If a single mood is selected, replace entirely with this mood's entries
              const sorted = [...moodEntries].sort((a, b) => (b.createdAtSecs || 0) - (a.createdAtSecs || 0));
              return sorted;
            });

            // update versionsList only if a single mood is selected and this is that mood
            if (selectedMood !== "All moods" && mood === selectedMood) {
              setVersionsList(moodEntries.map((e) => e.versionId));
            } else if (selectedMood === "All moods") {
              setVersionsList([]); // clear versions list when showing all moods
            }

            setLoading(false);
          } catch (err) {
            console.error("Real-time listener error for mood", mood, err);
            if (!mounted) return;
            setError("⚠ Failed to fetch entries in real-time. See console.");
            setLoading(false);
          }
        },
        (err) => {
          console.error("onSnapshot error for mood", mood, err);
          if (!mounted) return;
          setError("⚠ Real-time subscription error. See console.");
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
    if (!entry) {
      console.warn("Entry not found for edit:", versionId, mood);
      return;
    }

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

  // Delete a whole version and its categories
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { versionId, mood } = deleteTarget;
    try {
      setLoading(true);
      // delete category docs first
      const categoriesRef = collection(db, "moods", mood, "versions", versionId, "categories");
      const categoriesSnap = await getDocs(categoriesRef);
      for (const catDoc of categoriesSnap.docs) {
        await deleteDoc(doc(db, "moods", mood, "versions", versionId, "categories", catDoc.id));
      }
      // delete the version doc
      await deleteDoc(doc(db, "moods", mood, "versions", versionId));

      // optimistic update (real-time will also reflect change)
      setEntries((prev) => prev.filter((e) => !(e.versionId === versionId && e.mood === mood)));
      setShowDeleteModal(false);
      setDeleteTarget(null);
      alert("✅ Version deleted successfully!");
    } catch (err) {
      console.error("Error deleting version:", err);
      alert("❌ Failed to delete version. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-management p-3">
      <div className="page-header mb-2">
        <h3 className="mb-0">Content Management</h3>
        <p className="sub-text">To Add or Edit the entries select that specific mood</p>
      </div>

      <h5 className="mt-4">Select Mood</h5>
      <div className="d-flex gap-3 mb-3">
        <select
          className="form-select w-25"
          value={selectedMood}
          onChange={(e) => setSelectedMood(e.target.value)}
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
              setError("");
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

      {error && <p className="text-danger mb-3">{error}</p>}

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
                <td colSpan="5" className="text-center">
                  <div className="loader"><div></div><div></div><div></div><div></div></div>
                  <p style={{ color: "orange", marginTop: "0.5rem" }}>Loading versions...</p>
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">No versions found.</td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={`${e.mood}-${e.versionId}`}>
                  <td>{e.versionId}</td>
                  <td>{e.mood}</td>
                  <td>
                    <span className={`badge ${e.versionData?.live ? "bg-success" : "bg-secondary"}`}>
                      {e.versionData?.live ? "Live" : "Inactive"}
                    </span>
                  </td>
                  <td>{e.categories.map((c) => c.categoryName).join(", ")}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>

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
        fetchEntries={() => {}} // real-time handles updates; kept for compatibility
        existingVersions={versionsList}
      />

      {showDeleteModal && (
        <>
          <div className="modal-backdrop-custom" onClick={() => setShowDeleteModal(false)}></div>
          <div className="modal-custom">
            <div className="modal-content delete-modal">
              <div className="modal-body text-center">
                <FaExclamationTriangle className="delete-icon mb-3" />
                <h5 className="text-danger mb-2">Confirm Deletion</h5>
                <p>This will delete the entire version and its categories. This action cannot be undone.</p>
              </div>
              <div className="modal-footer justify-content-center">
                <Button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button className="delete-btn" onClick={handleDelete}>Delete</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContentManagement;
