import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaCloudUploadAlt, FaPlus } from "react-icons/fa";
import { createNewEntry, updateEntry } from "./Edit";

const MakeLiveToggle = ({ makeLive, setMakeLive }) => (
  <div className="make-live-toggle mt-3 p-3 rounded">
    <div className="d-flex justify-content-between align-items-center">
      <span className="fw-semibold text-dark">Make Live</span>
      <div className="form-check form-switch m-0">
        <input
          className="form-check-input custom-switch"
          type="checkbox"
          checked={!!makeLive}
          onChange={(e) => setMakeLive(e.target.checked)}
        />
      </div>
    </div>
    <small className="text-muted">
      When enabled, this version will replace the previous live one.
    </small>
  </div>
);

const AddNewEntry = ({
  showAddModal,
  setShowAddModal,
  makeLive,
  setMakeLive,
  selectedMood,
  fetchEntries,
  editingEntry,
  existingVersions = [],
}) => {
  const tabs = [
    "quickreset",
    "peptalk",
    "affirmation",
    "miniexercise",
    "reflections",
    "voicejourney",
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [loading, setLoading] = useState(false);
  const [tabData, setTabData] = useState(
    tabs.reduce((acc, tab) => {
      if (tab === "affirmation") {
        acc[tab] = { heading: "", affirmations: [""], voice: null };
      } else {
        acc[tab] = { heading: "", text: "", file: null, voice: null };
      }
      return acc;
    }, {})
  );
  const [versionName, setVersionName] = useState("V1");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingEntry) {
      const updatedTabData = tabs.reduce((acc, tab) => {
        const info =
          (editingEntry.categories || []).filter(
            (c) => c.categoryName === tab
          ) || [];
        if (tab === "affirmation") {
          acc[tab] = {
            heading: info[0]?.heading || "",
            affirmations: info.map((f) => f.text) || [""],
            voice: info[0]?.voice || null,
          };
        } else {
          acc[tab] = {
            heading: info[0]?.heading || "",
            text: info[0]?.text || "",
            voice: info[0]?.voice || null,
            file: null,
          };
        }
        return acc;
      }, {});
      setTabData(updatedTabData);
      setActiveTab(editingEntry.categoryName || tabs[0]);
      setVersionName(editingEntry.versionId || "V1");
      setMakeLive(!!editingEntry.versionData?.live);
    } else {
      const numbers = existingVersions
        .map((v) => {
          const m = (v || "").match(/^V(\d+)$/i);
          return m ? parseInt(m[1], 10) : null;
        })
        .filter(Boolean);

      const next = numbers.length ? Math.max(...numbers) + 1 : 1;
      setVersionName(`V${next}`);
      setTabData(
        tabs.reduce((acc, tab) => {
          if (tab === "affirmation") {
            acc[tab] = { heading: "", affirmations: [""], voice: null };
          } else {
            acc[tab] = { heading: "", text: "", file: null, voice: null };
          }
          return acc;
        }, {})
      );
      setActiveTab(tabs[0]);
      setMakeLive(false);
    }
  }, [editingEntry, existingVersions]);

  const handleTextChange = (e, field, index = null) => {
    if (activeTab === "affirmation" && index !== null) {
      const newAffirmations = [...tabData.affirmation.affirmations];
      newAffirmations[index] = e.target.value;
      setTabData((prev) => ({
        ...prev,
        affirmation: { ...prev.affirmation, affirmations: newAffirmations },
      }));
    } else {
      setTabData((prev) => ({
        ...prev,
        [activeTab]: { ...prev[activeTab], [field]: e.target.value },
      }));
    }
  };

  const addAffirmationField = () => {
    setTabData((prev) => ({
      ...prev,
      affirmation: {
        ...prev.affirmation,
        affirmations: [...prev.affirmation.affirmations, ""],
      },
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTabData((prev) => ({
        ...prev,
        [activeTab]: { ...prev[activeTab], file, voice: null },
      }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    setTabData((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], file },
    }));
  };

  const handleSave = async () => {
    if (!selectedMood || selectedMood === "All moods") {
      alert("⚠ Please select a valid mood before publishing.");
      return;
    }

    try {
      setLoading(true);
      if (editingEntry) {
        await updateEntry(selectedMood, versionName, makeLive, tabData, tabs);
      } else {
        await createNewEntry(selectedMood, versionName, makeLive, tabData, tabs);
      }
      alert("✅ Entry saved successfully!");
      setShowAddModal(false);
      await fetchEntries(selectedMood);
    } catch (error) {
      console.error(error);
      alert("❌ Failed to save entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={showAddModal}
      onHide={() => setShowAddModal(false)}
      size="lg"
      centered
      contentClassName="add-version-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {editingEntry
            ? `Edit Version (${versionName})`
            : `Add New Version (${versionName})`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="version-tabs mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-pill ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <Form.Group className="mb-3">
          <Form.Label className="section-label">Heading</Form.Label>
          <Form.Control
            type="text"
            value={tabData[activeTab]?.heading || ""}
            onChange={(e) => handleTextChange(e, "heading")}
            placeholder={`Enter heading for "${activeTab}"...`}
          />
        </Form.Group>

        {activeTab === "affirmation" ? (
          <div className="affirmation-section mb-4">
            {tabData.affirmation.affirmations.map((sentence, idx) => (
              <div key={idx} className="d-flex gap-2 mb-2 align-items-center">
                <Form.Control
                  type="text"
                  value={sentence}
                  placeholder={`Enter affirmation ${idx + 1}...`}
                  onChange={(e) =>
                    handleTextChange(e, "affirmations", idx)
                  }
                />
                <Button variant="outline-success" size="sm" onClick={addAffirmationField}>
                  <FaPlus />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Form.Group className="mb-4">
            <Form.Label className="section-label">Content Text</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={tabData[activeTab]?.text || ""}
              onChange={(e) => handleTextChange(e, "text")}
            />
          </Form.Group>
        )}

        <div
          className="upload-box mb-4 p-4 text-center"
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <FaCloudUploadAlt className="upload-icon mb-2" />
          {tabData[activeTab]?.file ? (
            typeof tabData[activeTab].file === "string" ? (
              <div className="fw-semibold">Audio uploaded</div>
            ) : (
              <div className="fw-semibold">{tabData[activeTab].file.name}</div>
            )
          ) : (
            <div className="fw-semibold">Click to upload audio or drag and drop</div>
          )}
          <input
            type="file"
            accept=".mp3,.wav"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </div>

        <MakeLiveToggle makeLive={makeLive} setMakeLive={setMakeLive} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" disabled={loading} onClick={handleSave}>
          {loading ? "Saving..." : editingEntry ? "Update Version" : "Create Version"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddNewEntry;
