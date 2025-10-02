import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaCloudUploadAlt, FaPlus, FaMinus } from "react-icons/fa";
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
      When enabled, this version will be live on your mobile app.
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

  const tabConfig = {
    quickreset: { allowText: true, allowVoice: true },
    peptalk: { allowText: true, allowVoice: true },
    affirmation: {
      allowText: true,
      allowVoice: true,
      multipleAffirmations: true,
    },
    miniexercise: { allowText: true, allowVoice: false },
    reflections: { allowText: true, allowVoice: false },
    voicejourney: { allowText: true, allowVoice: true, noHeading: true },
  };

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const [tabData, setTabData] = useState(
    tabs.reduce((acc, tab) => {
      const config = tabConfig[tab];
      acc[tab] = {
        heading: "",
        ...(config.multipleAffirmations
          ? { affirmations: [""] }
          : config.allowText
          ? { text: "" }
          : {}),
        ...(config.allowVoice ? { file: null, voice: null } : {}),
      };
      return acc;
    }, {})
  );

  const [versionName, setVersionName] = useState("V1");
  const fileInputRef = useRef(null);

  // ✅ Load existing entry (edit mode)
  useEffect(() => {
    if (editingEntry) {
      const updatedTabData = tabs.reduce((acc, tab) => {
        const config = tabConfig[tab];
        const info = (editingEntry.categories || []).filter(
          (c) => c.categoryName === tab
        );

        acc[tab] = {
          heading: info[0]?.heading || "",
          ...(config.multipleAffirmations
            ? {
                affirmations: info.length
                  ? info.map((f) => f.text || "")
                  : [""],
              }
            : config.allowText
            ? { text: info[0]?.text || "" }
            : {}),
          ...(config.allowVoice
            ? { voice: info[0]?.voice || null, file: null }
            : {}),
        };
        return acc;
      }, {});
      setTabData(updatedTabData);
      setActiveTab(editingEntry.categoryName || tabs[0]);
      setVersionName(editingEntry.versionId || "V1");
      setMakeLive(!!editingEntry.versionData?.live);
    } else {
      // Fresh entry mode
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
          const config = tabConfig[tab];
          acc[tab] = {
            heading: "",
            ...(config.multipleAffirmations
              ? { affirmations: [""] }
              : config.allowText
              ? { text: "" }
              : {}),
            ...(config.allowVoice ? { file: null, voice: null } : {}),
          };
          return acc;
        }, {})
      );
      setActiveTab(tabs[0]);
      setMakeLive(false);
    }
  }, [editingEntry, existingVersions]);

  // ✅ Handle affirmations + text
  const handleTextChange = (e, field, index = null) => {
    if (activeTab === "affirmation" && index !== null) {
      setTabData((prev) => {
        const newAffirmations = [...prev.affirmation.affirmations];
        newAffirmations[index] = e.target.value;
        return {
          ...prev,
          affirmation: { ...prev.affirmation, affirmations: newAffirmations },
        };
      });
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

  const removeAffirmationField = (index) => {
    setTabData((prev) => {
      const newAffirmations = [...prev.affirmation.affirmations];
      newAffirmations.splice(index, 1);
      return {
        ...prev,
        affirmation: { ...prev.affirmation, affirmations: newAffirmations },
      };
    });
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
      setToastMsg("⚠ Please select a valid mood before publishing.");
      return;
    }

    try {
      setLoading(true);
      if (editingEntry) {
        await updateEntry(selectedMood, versionName, makeLive, tabData, tabs);
      } else {
        await createNewEntry(selectedMood, versionName, makeLive, tabData, tabs);
      }
      setToastMsg("✅ Entry saved successfully!");
      setShowAddModal(false);
      await fetchEntries(selectedMood);
    } catch (error) {
      console.error(error);
      setToastMsg("❌ Failed to save entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toastMsg && (
        <div
          className="toast-message"
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#333",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
            zIndex: 2000,
            fontSize: "0.95rem",
            fontWeight: "500",
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          {toastMsg}
        </div>
      )}

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

          {/* Heading (hidden for voicejourney) */}
          {!tabConfig[activeTab].noHeading && (
            <Form.Group className="mb-3">
              <Form.Label className="section-label">Heading</Form.Label>
              <Form.Control
                type="text"
                value={tabData[activeTab]?.heading || ""}
                onChange={(e) => handleTextChange(e, "heading")}
                placeholder={`Enter heading for "${activeTab}"...`}
              />
            </Form.Group>
          )}

          {/* ✅ Affirmation Section */}
          {tabConfig[activeTab].multipleAffirmations ? (
            <div className="affirmation-section mb-4">
              <Form.Label className="section-label">Affirmations</Form.Label>
              {tabData.affirmation.affirmations.map((sentence, idx) => (
                <div key={idx} className="d-flex gap-2 mb-2 align-items-center">
                  <Form.Control
                    type="text"
                    value={sentence}
                    placeholder={`Enter affirmation ${idx + 1} ...`}
                    onChange={(e) => handleTextChange(e, "affirmations", idx)}
                  />
                  {idx === 0 ? (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={addAffirmationField}
                    >
                      <FaPlus />
                    </Button>
                  ) : (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeAffirmationField(idx)}
                    >
                      <FaMinus />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            tabConfig[activeTab].allowText && (
              <Form.Group className="mb-4">
                <Form.Label className="section-label">Content Text</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={tabData[activeTab]?.text || ""}
                  onChange={(e) => handleTextChange(e, "text")}
                  placeholder={`Enter content for "${activeTab}"...`}
                />
              </Form.Group>
            )
          )}

          {/* File Upload */}
          {tabConfig[activeTab].allowVoice && (
            <div
              className="upload-box mb-4 p-4 text-center"
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <FaCloudUploadAlt className="upload-icon mb-2" />
              {tabData[activeTab]?.file ? (
                <div className="fw-semibold">{tabData[activeTab].file.name}</div>
              ) : tabData[activeTab]?.voice ? (
                <div className="fw-semibold">
                  {typeof tabData[activeTab].voice === "string"
                    ? tabData[activeTab].voice.split("/").pop()
                    : "Existing audio"}
                </div>
              ) : (
                <div className="fw-semibold">
                  Click to upload audio or drag and drop
                </div>
              )}
              <input
                type="file"
                accept=".mp3,.wav"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
            </div>
          )}

          <MakeLiveToggle makeLive={makeLive} setMakeLive={setMakeLive} />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={loading} onClick={handleSave}>
            {loading
              ? "Saving new data"
              : editingEntry
              ? "Update Version"
              : "Create Version"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddNewEntry;
