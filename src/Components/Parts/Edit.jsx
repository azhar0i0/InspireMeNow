import { db, storage } from "../../firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Convert affirmations array into text1, text2, text3, ...
 */
const buildTextField = (tabData, tab) => {
  if (tab === "affirmation") {
    const obj = {};
    (tabData[tab].affirmations || []).forEach((txt, idx) => {
      if (txt.trim()) obj[`text${idx + 1}`] = txt;
    });
    return obj;
  } else {
    return { text: tabData[tab]?.text || "" };
  }
};

/**
 * Create a new version for a mood
 */
export const createNewEntry = async (mood, versionName, makeLive, tabData, tabs) => {
  try {
    const versionRef = doc(db, "moods", mood, "versions", versionName);

    await setDoc(versionRef, {
      live: !!makeLive,
      createdAt: serverTimestamp(),
    });

    for (const tab of tabs) {
      const catRef = doc(db, "moods", mood, "versions", versionName, "categories", tab);

      let voiceUrl = null;
      if (tabData[tab]?.file) {
        const file = tabData[tab].file;
        const storageRef = ref(storage, `voices/${mood}/${versionName}/${tab}/${file.name}`);
        await uploadBytes(storageRef, file);
        voiceUrl = await getDownloadURL(storageRef);
      } else if (tabData[tab]?.voice) {
        voiceUrl = tabData[tab].voice;
      }

      const textField = buildTextField(tabData, tab);

      await setDoc(catRef, {
        heading: tabData[tab]?.heading || "",
        ...textField,
        voice: voiceUrl || null,
        live: !!makeLive,
        updatedAt: serverTimestamp(),
      });
    }

    console.log("✅ New entry created:", mood, versionName);
  } catch (err) {
    console.error("❌ createNewEntry error:", err);
    throw err;
  }
};

/**
 * Update an existing version
 */
export const updateEntry = async (mood, versionName, makeLive, tabData, tabs) => {
  try {
    const versionRef = doc(db, "moods", mood, "versions", versionName);

    await updateDoc(versionRef, {
      live: !!makeLive,
      updatedAt: serverTimestamp(),
    });

    for (const tab of tabs) {
      const catRef = doc(db, "moods", mood, "versions", versionName, "categories", tab);

      let voiceUrl = tabData[tab]?.voice || null;
      if (tabData[tab]?.file) {
        const file = tabData[tab].file;
        const storageRef = ref(storage, `voices/${mood}/${versionName}/${tab}/${file.name}`);
        await uploadBytes(storageRef, file);
        voiceUrl = await getDownloadURL(storageRef);
      }

      const textField = buildTextField(tabData, tab);

      await setDoc(catRef, {
        heading: tabData[tab]?.heading || "",
        ...textField,
        voice: voiceUrl || null,
        live: !!makeLive,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    console.log("✅ Entry updated:", mood, versionName);
  } catch (err) {
    console.error("❌ updateEntry error:", err);
    throw err;
  }
};
