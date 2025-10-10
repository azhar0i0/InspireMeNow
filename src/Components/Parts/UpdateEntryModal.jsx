// src/Components/Parts/UpdateEntryModal.jsx
import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaCloudUploadAlt, FaPlus, FaMinus } from "react-icons/fa";
import { updateEntry } from "./Edit"; // Assuming this update function exists

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


const UpdateEntryModal = ({ show, onHide, editingEntry, onUpdateSuccess }) => {
  const tabs = [ "quickreset", "peptalk", "affirmation", "miniexercise", "reflections", "voicejourney"];
  const tabConfig = {
    quickreset: { allowText: true, allowVoice: true },
    peptalk: { allowText: true, allowVoice: true },
    affirmation: { allowText: true, allowVoice: true, multipleAffirmations: true },
    miniexercise: { allowText: true, allowVoice: false },
    reflections: { allowText: true, allowVoice: false },
    voicejourney: { allowText: true, allowVoice: true, noHeading: true },
  };

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [makeLive, setMakeLive] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize state
  const initializeState = () => tabs.reduce((acc, tab) => {
      const config = tabConfig[tab];
      acc[tab] = {
        heading: "",
        ...(config.multipleAffirmations ? { affirmations: [""] } : config.allowText ? { text: "" } : {}),
        ...(config.allowVoice ? { file: null, voice: null } : {}),
      };
      return acc;
    }, {});

  const [tabData, setTabData] = useState(initializeState());

  // Load data when modal is opened with an entry
  useEffect(() => {
    if (editingEntry) {
      const updatedTabData = tabs.reduce((acc, tab) => {
        const config = tabConfig[tab];
        const info = (editingEntry.categories || []).filter((c) => c.categoryName === tab);
        let affirmations = [""];
        if (tab === "affirmation" && info.length > 0) {
          const item = info[0];
          affirmations = Object.keys(item).filter((k) => k.startsWith("text")).map((k) => item[k]).filter(Boolean);
          if (affirmations.length === 0) affirmations = [""];
        }
        acc[tab] = {
          heading: info[0]?.heading || "",
          ...(config.multipleAffirmations ? { affirmations } : config.allowText ? { text: info[0]?.text || "" } : {}),
          ...(config.allowVoice ? { voice: info[0]?.voice || null, file: null } : {}),
        };
        return acc;
      }, {});
      setTabData(updatedTabData);
      setActiveTab(editingEntry.categories[0]?.categoryName || tabs[0]);
      setMakeLive(!!editingEntry.versionData?.live);
    }
  }, [editingEntry]);

  const handleTextChange = (e, field, index = null) => {
    if (activeTab === "affirmation" && index !== null) {
        setTabData((prev) => {
            const newAffirmations = [...prev.affirmation.affirmations];
            newAffirmations[index] = e.target.value;
            return { ...prev, affirmation: { ...prev.affirmation, affirmations: newAffirmations } };
        });
    } else {
        setTabData((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], [field]: e.target.value } }));
    }
  };

  const addAffirmationField = () => setTabData((prev) => ({ ...prev, affirmation: { ...prev.affirmation, affirmations: [...prev.affirmation.affirmations, ""] } }));
  
  const removeAffirmationField = (index) => setTabData((prev) => {
      const newAffirmations = prev.affirmation.affirmations.filter((_, i) => i !== index);
      return { ...prev, affirmation: { ...prev.affirmation, affirmations: newAffirmations } };
    });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setTabData((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], file, voice: null } }));
  };

  const handleUpdate = async () => {
    if (!editingEntry) return;
    setLoading(true);
    try {
      const transformedTabData = {
        ...tabData,
        affirmation: {
          ...tabData.affirmation,
          ...tabData.affirmation.affirmations.reduce((acc, text, idx) => {
            acc[`text${idx + 1}`] = text;
            return acc;
          }, {}),
        },
      };
      
      await updateEntry(editingEntry.mood, editingEntry.versionId, makeLive, transformedTabData, tabs);
      onUpdateSuccess(); // Notify parent component of success
    } catch (error) {
      console.error(error);
      setToastMsg("❌ Failed to update entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered contentClassName="add-version-modal">
      <Modal.Header closeButton>
        <Modal.Title>Update Version ({editingEntry?.versionId})</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="version-tabs mb-4">
          {tabs.map((tab) => (
            <button key={tab} className={`tab-pill ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {!tabConfig[activeTab].noHeading && (
          <Form.Group className="mb-3">
            <Form.Label className="section-label">Heading</Form.Label>
            <Form.Control type="text" value={tabData[activeTab]?.heading || ""} onChange={(e) => handleTextChange(e, "heading")} />
          </Form.Group>
        )}
        
        {tabConfig[activeTab].multipleAffirmations ? (
          <div className="affirmation-section mb-4">
             <Form.Label className="section-label">Affirmations</Form.Label>
              {tabData.affirmation.affirmations.map((sentence, idx) => (
                  <div key={idx} className="d-flex gap-2 mb-2 align-items-center">
                      <Form.Control type="text" value={sentence} placeholder={`Enter affirmation ${idx + 1} ...`} onChange={(e) => handleTextChange(e, "affirmations", idx)}/>
                      <Button variant={idx === 0 ? "outline-success" : "outline-danger"} size="sm" onClick={() => idx === 0 ? addAffirmationField() : removeAffirmationField(idx)}>
                          {idx === 0 ? <FaPlus /> : <FaMinus />}
                      </Button>
                  </div>
              ))}
          </div>
        ) : (tabConfig[activeTab].allowText && (
            <Form.Group className="mb-4">
                <Form.Label className="section-label">Content Text</Form.Label>
                <Form.Control as="textarea" rows={4} value={tabData[activeTab]?.text || ""} onChange={(e) => handleTextChange(e, "text")}/>
            </Form.Group>
        ))}

        {tabConfig[activeTab].allowVoice && (
          <div className="upload-box mb-4 p-4 text-center" onClick={() => fileInputRef.current.click()}>
            <FaCloudUploadAlt className="upload-icon mb-2" />
            {tabData[activeTab]?.file ? (<div className="fw-semibold">{tabData[activeTab].file.name}</div>) : 
             tabData[activeTab]?.voice ? (<div className="fw-semibold">Existing audio file is present. Upload to replace.</div>) : 
             (<div className="fw-semibold">Click to upload audio or drag and drop</div>)
            }
            <input type="file" accept=".mp3,.wav" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />
          </div>
        )}

        <MakeLiveToggle makeLive={makeLive} setMakeLive={setMakeLive} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" disabled={loading} onClick={handleUpdate}>
          {loading ? "Saving..." : "Update Version"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateEntryModal;