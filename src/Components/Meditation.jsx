import React, { useEffect, useState, useRef } from "react";
import "./designs/Meditation.css";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function Meditation() {
  const [meditations, setMeditations] = useState([]);
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({
    heading: "",
    text: "",
    audio: "", // audio file name
    audioUrl: "", // audio file URL (if exists)
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const fileInputRef = useRef(null);

  // realtime fetch
  useEffect(() => {
    const col = collection(db, "meditations");
    const unsub = onSnapshot(col, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMeditations(arr);
    });

    return () => unsub();
  }, []);

  // open popup for updating an existing meditation only
  const handleEdit = (meditation) => {
    if (!meditation) return; // don't allow add
    setSelectedMeditation(meditation);
    setForm({
      heading: meditation.heading || "",
      text: meditation.text || "",
      audio: meditation.audio || "",
      audioUrl: meditation.audioUrl || "",
    });
    setSelectedFile(null);
    setUploadProgress(0);
    setShowPopup(true);
  };

  // handle file selection
  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    setForm((p) => ({ ...p, audio: f.name }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    setForm((p) => ({ ...p, audio: f.name }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    // keep existing audio as-is until user saves
    setForm((p) => ({ ...p, audio: selectedMeditation?.audio || "", audioUrl: selectedMeditation?.audioUrl || "" }));
    setUploadProgress(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // Save -> upload file if selected, then update Firestore
  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedMeditation) {
      setToastMsg("Select a meditation to update.");
      setTimeout(() => setToastMsg(""), 3000);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let audioUrl = form.audioUrl || "";
      let audioName = form.audio || "";

      if (selectedFile) {
        // upload with progress
        const storage = getStorage();
        // Use timestamp prefix to avoid collisions
        const filename = `${Date.now()}_${selectedFile.name}`;
        const sref = storageRef(storage, `meditations/${selectedMeditation.id}/${filename}`);
        const uploadTask = uploadBytesResumable(sref, selectedFile);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadProgress(progress);
            },
            (err) => {
              reject(err);
            },
            async () => {
              audioUrl = await getDownloadURL(uploadTask.snapshot.ref);
              audioName = selectedFile.name;
              resolve();
            }
          );
        });
      }

      // prepare update payload
      const payload = {
        heading: form.heading,
        text: form.text,
      };
      // set audio name/url if available
      if (audioName) payload.audio = audioName;
      if (audioUrl) payload.audioUrl = audioUrl;

      await updateDoc(doc(db, "meditations", selectedMeditation.id), payload);

      setToastMsg("✅ Meditation updated successfully.");
      setTimeout(() => setToastMsg(""), 3500);

      // close modal & reset
      setShowPopup(false);
      setSelectedMeditation(null);
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (err) {
      console.error("Update error:", err);
      setToastMsg("❌ Failed to update. Check console.");
      setTimeout(() => setToastMsg(""), 4000);
    } finally {
      setUploading(false);
    }
  };

  const extractFileNameFromUrl = (url) => {
    if (!url) return "";
    try {
      const parts = url.split("/").pop().split("?")[0];
      return decodeURIComponent(parts);
    } catch {
      return url;
    }
  };

  return (
    <div className="meditation-page">
      <div className="page-header mb-3">
        <h3 className="mb-0">Meditation</h3>
        <p className="sub-text">Click Update to update heading, text and audio for meditation.</p>
      </div>

      {toastMsg && <div className="inline-toast">{toastMsg}</div>}

      <div className="meditation-list">
        {meditations.length === 0 ? (
          <p className="no-data">No meditation entries found.</p>
        ) : (
          meditations.map((item) => {
            const displayAudioName = item.audio || item.audioName || extractFileNameFromUrl(item.audioUrl);
            return (
              <div className="meditation-card" key={item.id}>
                <div className="meditation-left">
                  <h4 className="med-heading">{item.heading}</h4>

                  <div className="audio-display">
                    <div className="audio-label">Audio</div>
                    {item.audioUrl ? (
                      <>
                        <div className="audio-name">{displayAudioName}</div>
                        <audio className="audio-player" controls src={item.audioUrl}>
                          Your browser does not support the audio element.
                        </audio>
                      </>
                    ) : (
                      <div className="audio-name muted">No audio uploaded</div>
                    )}
                  </div>
                </div>

                <div className="meditation-right">
                  <p className="med-text">{item.text}</p>
                </div>

                <div className="card-actions">
                  <button className="update-btn" onClick={() => handleEdit(item)}>
                    Update
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Update Popup */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => !uploading && setShowPopup(false)}>
          <div className="popup-box slide-in scrollable-invisible" onClick={(e) => e.stopPropagation()}>
            <h2 className="popup-title">Update Meditation</h2>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="section-label">Heading</label>
                <input
                  type="text"
                  name="heading"
                  value={form.heading}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="section-label">Audio</label>

                <div
                  className={`upload-box ${selectedFile ? "has-file" : ""}`}
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <FaCloudUploadAlt className="upload-icon" />
                  {selectedFile ? (
                    <div className="upload-text">
                      <div className="fw-semibold">{selectedFile.name}</div>
                      <small className="muted">Click or drag another file to replace</small>
                      <div className="file-actions">
                        <button type="button" className="small-btn" onClick={handleRemoveSelectedFile}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : form.audioUrl ? (
                    <div className="upload-text">
                      <div className="fw-semibold">{form.audio || extractFileNameFromUrl(form.audioUrl)}</div>
                      <small className="muted">Existing audio — upload to replace</small>
                      <audio className="audio-player" controls src={form.audioUrl}>
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ) : (
                    <div className="upload-text">
                      <div className="fw-semibold">Click to upload audio or drag and drop</div>
                      <small className="muted">Accepts .mp3, .wav</small>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp3,.wav"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                  />
                </div>

                {uploading && (
                  <div className="upload-progress">
                    <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
                    <div className="progress-text">{uploadProgress}%</div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="section-label">Text</label>
                <textarea
                  name="text"
                  rows={5}
                  value={form.text}
                  onChange={handleChange}
                  className="form-control scrollable-invisible"
                  required
                />
              </div>

              <div className="modal-footer-custom">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => !uploading && setShowPopup(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-btn" disabled={uploading}>
                  {uploading ? `Uploading ${uploadProgress}%` : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
