import React, { useEffect, useState, useRef } from "react";
import "./designs/Meditation.css";
import { db } from "../firebase";
import {
  onSnapshot,
  doc,
  setDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function Meditation() {
  const [meditation, setMeditation] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({
    heading: "",
    text: "",
    audio: "",
    audioUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const fileInputRef = useRef(null);


  useEffect(() => {
    const unsub = onSnapshot(doc(db, "meditations", "meditation-id"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setMeditation({ id: "meditation-id", ...data });
      } else {
        setMeditation(null);
      }
    });
    return () => unsub();
  }, []);

  const handleEdit = () => {
    if (!meditation) return;
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

  const handleDragOver = (e) => e.preventDefault();

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    setForm((p) => ({
      ...p,
      audio: meditation?.audio || "",
      audioUrl: meditation?.audioUrl || "",
    }));
    setUploadProgress(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setUploading(true);
    setUploadProgress(0);

    try {
      let audioUrl = form.audioUrl || "";
      let audioName = form.audio || "";

      if (selectedFile) {
        const storage = getStorage();
        const filename = `${Date.now()}_${selectedFile.name}`;
        const sref = storageRef(storage, `meditations/medi/${filename}`);
        const uploadTask = uploadBytesResumable(sref, selectedFile);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setUploadProgress(progress);
            },
            reject,
            async () => {
              audioUrl = await getDownloadURL(uploadTask.snapshot.ref);
              audioName = selectedFile.name;
              resolve();
            }
          );
        });
      }

      const payload = {
        heading: form.heading,
        text: form.text,
        audio: audioName,
        audioUrl,
      };

      await setDoc(doc(db, "meditations", "meditation-id"), payload, { merge: true });

      setToastMsg("✔ Meditation updated successfully.");
      setTimeout(() => setToastMsg(""), 3000);

      setShowPopup(false);
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (err) {
      console.error("Update error:", err);
      setToastMsg("✘ Failed to update. Check console.");
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
        <p className="sub-text">
          Click Update to modify heading, text, and audio for meditation.
        </p>
      </div>

      {toastMsg && (
  <div className={`custom-toast ${toastMsg.includes("✔") ? "success" : "error"}`}>
    <span className="toast-icon">
      {toastMsg.includes("✔") ? "✔" : "!"}
    </span>
    <span className="toast-text">{toastMsg.replace("✔ ", "").replace("✘ ", "")}</span>
  </div>
)}


      {meditation ? (
        <div className="meditation-card">
          <div className="meditation-left">
            <h4 className="med-heading">{meditation.heading}</h4>
            <div className="audio-display">
              <div className="audio-label">Audio</div>
              {meditation.audioUrl ? (
                <>
                  <div className="audio-name">
                    {meditation.audio || extractFileNameFromUrl(meditation.audioUrl)}
                  </div>
                  <audio className="audio-player" controls src={meditation.audioUrl} />
                </>
              ) : (
                <div className="audio-name muted">No audio uploaded</div>
              )}
            </div>
          </div>
          <div className="meditation-right">
            <p className="med-text">{meditation.text}</p>
          </div>
          <div className="card-actions">
            <button className="update-btn" onClick={handleEdit}>
              Update
            </button>
          </div>
        </div>
      ) : (
        <div className="no-data text-center">
          <p>No meditation data found.</p>
          <button
            className="update-btn"
            style={{ marginTop: "10px" }}
            onClick={() => {
              setForm({ heading: "", text: "", audio: "", audioUrl: "" });
              setShowPopup(true);
            }}
          >
            Add Meditation
          </button>
        </div>
      )}

      {/* Popup */}
      {showPopup && (
        <div
          className="popup-overlay"
          onClick={() => !uploading && setShowPopup(false)}
        >
          <div
            className="popup-box slide-in scrollable-invisible"
            onClick={(e) => e.stopPropagation()}
          >
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
                      <small className="muted">
                        Click or drag another file to replace
                      </small>
                      <div className="file-actions">
                        <button
                          type="button"
                          className="small-btn"
                          onClick={handleRemoveSelectedFile}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : form.audioUrl ? (
                    <div className="upload-text">
                      <div className="fw-semibold">
                        {form.audio || extractFileNameFromUrl(form.audioUrl)}
                      </div>
                      <small className="muted">
                        Existing audio — upload to replace
                      </small>
                      <audio
                        className="audio-player"
                        controls
                        src={form.audioUrl}
                      />
                    </div>
                  ) : (
                    <div className="upload-text">
                      <div className="fw-semibold">
                        Click to upload audio or drag and drop
                      </div>
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
                    <div
                      className="progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    />
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
                  {uploading
                    ? `Uploading ${uploadProgress}%`
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
