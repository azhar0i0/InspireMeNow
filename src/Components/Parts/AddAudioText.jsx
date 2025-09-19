import React, { useState } from "react";
import { db, storage } from "../../firebase"; // ✅ correct path
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AddAudioText = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let fileURL = "";

      // Upload to Firebase Storage
      if (file) {
        const storageRef = ref(storage, `uploads/${file.name}`);
        await uploadBytes(storageRef, file);
        fileURL = await getDownloadURL(storageRef);
      }

      // Add to Firestore
      await addDoc(collection(db, "audioTexts"), {
        text,
        fileURL,
        createdAt: new Date(),
      });

      alert("✅ Data added successfully!");
      setText("");
      setFile(null);
    } catch (error) {
      console.error("❌ Error adding document: ", error);
      alert("Error saving data!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text..."
      />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit">Save</button>
    </form>
  );
};

export default AddAudioText;
