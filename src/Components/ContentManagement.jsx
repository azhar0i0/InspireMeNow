import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import "./designs/ContentManagement.css";
import { FaExclamationTriangle } from "react-icons/fa";
import AddNewEntry from "./Parts/AddNewEntry";
import { DEMO_ENTRIES } from "./Parts/demoData";

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
  const [editingEntry, setEditingEntry] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [entryName, setEntryName] = useState("");
  const [makeLive, setMakeLive] = useState(false);
  const [selectedMood, setSelectedMood] = useState("All moods");
  const [toastMsg, setToastMsg] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setLoading(true);
    const moodsToFetch = selectedMood === "All moods" ? MOODS : [selectedMood];
    let filtered = DEMO_ENTRIES.filter((e) => moodsToFetch.includes(e.mood));

    filtered.sort((a, b) => (b.createdAtSecs || 0) - (a.createdAtSecs || 0));
    setEntries(filtered);
    setLoading(false);
    setVersionsList(filtered.map((e) => e.versionId));
    setCurrentPage(1);
  }, [selectedMood]);

  const handleEdit = (versionId, mood) => {
    const entry = entries.find((e) => e.versionId === versionId && e.mood === mood);
    if (!entry) return;

    setEditingEntry(entry);
    setEntryName(entry.versionData.entryName || "");
    setMakeLive(!!entry.versionData.live);
    setShowAddModal(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setEntries(entries.filter((e) => !(e.versionId === deleteTarget.versionId && e.mood === deleteTarget.mood)));
    setShowDeleteModal(false);
    setToastMsg("✔ Version deleted successfully!");
  };

  const totalPages = Math.ceil(entries.length / itemsPerPage);
  const handlePageChange = (page) => { if(page>=1 && page<=totalPages) setCurrentPage(page); };
  const getPaginatedEntries = () => {
    const start = (currentPage-1)*itemsPerPage;
    return entries.slice(start, start+itemsPerPage);
  };

  const getVisiblePages = () => {
    const pagesToShow = 3;
    let start = Math.max(currentPage - 1, 1);
    let end = start + pagesToShow - 1;
    if (end > totalPages) { end = totalPages; start = Math.max(end - pagesToShow + 1, 1); }
    const pages = [];
    for (let i=start;i<=end;i++) pages.push(i);
    return pages;
  };

  return (
    <div className="content-management p-3">
      {toastMsg && (
        <div className={`custom-toast ${toastMsg.includes("✔") ? "success" : "error"}`}>
          <span className="toast-icon">{toastMsg.includes("✔") ? "✔" : "!"}</span>
          <span className="toast-text">{toastMsg.replace("✔ ", "")}</span>
        </div>
      )}

      <div className="page-header mb-2">
        <h3 className="mb-0">Content Management</h3>
        <p className="sub-text">To Add or Edit the entries select that specific mood</p>
      </div>

      <h5 className="mt-4">Select Mood</h5>
      <div className="d-flex gap-3 mb-3 select-mood-row">
        <select className="form-select" value={selectedMood} onChange={(e)=>setSelectedMood(e.target.value)} style={{height:"36px"}}>
          <option>All moods</option>
          {MOODS.map((m)=> <option key={m}>{m}</option>)}
        </select>

        {selectedMood !== "All moods" && (
          <Button className="btn btn-primary" onClick={()=>{setEditingEntry(null); setEntryName(""); setMakeLive(false); setShowAddModal(true);}}>
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
              <tr><td colSpan="6" className="text-center">Loading versions...</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-muted">No versions found.</td></tr>
            ) : (
              getPaginatedEntries().map((e) => {
                const categoryNames = e.categories.map((c)=>c.categoryName);
                return (
                  <tr key={`${e.mood}-${e.versionId}`}>
                    <td>{e.versionId}</td>
                    <td>{e.mood}</td>
                    <td><span className={`badge ${e.versionData.live ? "bg-success" : "bg-secondary"}`}>{e.versionData.live ? "Live" : "Inactive"}</span></td>
                    <td>{ALL_CATEGORIES.every(cat=>categoryNames.includes(cat))?"All Tabs":"All Tabs"}</td>
                    <td>
                      {selectedMood!=="All moods" && <Button variant="outline-info" size="sm" className="me-2" onClick={()=>handleEdit(e.versionId,e.mood)}>✎</Button>}
                      <Button variant="outline-danger" size="sm" onClick={()=>{setDeleteTarget({versionId:e.versionId,mood:e.mood}); setShowDeleteModal(true);}}>🗑</Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {entries.length > itemsPerPage && (
        <div className="pagination-wrapper d-flex justify-content-between align-items-center mt-2">
          <div className="text-muted small">Showing {getPaginatedEntries().length} out of {entries.length} entries</div>
          <div className="pagination-container">
            <button className="pagination-btn" disabled={currentPage===1} onClick={()=>handlePageChange(currentPage-1)}>‹ Prev</button>
            {getVisiblePages().map(p=><button key={p} className={`pagination-btn ${currentPage===p?"active":""}`} onClick={()=>handlePageChange(p)}>{p}</button>)}
            <button className="pagination-btn" disabled={currentPage===totalPages} onClick={()=>handlePageChange(currentPage+1)}>Next ›</button>
          </div>
        </div>
      )}

      <AddNewEntry
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        editingEntry={editingEntry}
        entryName={entryName}
        setEntryName={setEntryName}
        makeLive={makeLive}
        setMakeLive={setMakeLive}
        selectedMood={selectedMood}
        fetchEntries={()=>{}}
        existingVersions={versionsList}
      />

      {showDeleteModal && (
        <>
          <div className="modal-backdrop-custom" onClick={()=>setShowDeleteModal(false)}></div>
          <div className="modal-custom">
            <div className="modal-content delete-modal">
              <div className="modal-body delete-body text-center">
                <FaExclamationTriangle className="delete-icon mb-3" />
                <h5 className="delete-title">Confirm Deletion</h5>
                <p>You are about to delete <b>'{deleteTarget?.versionId}'</b>. This action cannot be undone.</p>
              </div>
              <div className="modal-footer-custom">
                <Button className="cancel-btn" onClick={()=>setShowDeleteModal(false)}>Cancel</Button>
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
