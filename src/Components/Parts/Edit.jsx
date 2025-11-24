// src/Components/Parts/Edit.jsx
import { DEMO_MOODS } from "./demoData";   // ✅ FIXED — named import


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
 * Create a new version for a mood (local demo data)
 */
export const createNewEntry = async (mood, versionName, makeLive, tabData, tabs) => {
  try {
    if (!DEMO_MOODS[mood]) DEMO_MOODS[mood] = { versions: {} };

    DEMO_MOODS[mood].versions[versionName] = {
      live: !!makeLive,
      createdAt: new Date(),
      categories: {},
    };

    for (const tab of tabs) {
      const textField = buildTextField(tabData, tab);

      DEMO_MOODS[mood].versions[versionName].categories[tab] = {
        heading: tabData[tab]?.heading || "",
        ...textField,
        voice: tabData[tab]?.voice || null,
        live: !!makeLive,
      };
    }

    console.log("✅ New entry created (demo):", mood, versionName);
  } catch (err) {
    console.error("❌ createNewEntry error (demo):", err);
    throw err;
  }
};


/**
 * Update an existing version (local demo data)
 */
export const updateEntry = async (mood, versionName, makeLive, tabData, tabs) => {
  try {
    if (!DEMO_MOODS[mood]) DEMO_MOODS[mood] = { versions: {} };

    if (!DEMO_MOODS[mood].versions[versionName]) {
      DEMO_MOODS[mood].versions[versionName] = {
        live: !!makeLive,
        createdAt: new Date(),
        categories: {},
      };
    }

    DEMO_MOODS[mood].versions[versionName].live = !!makeLive;
    DEMO_MOODS[mood].versions[versionName].updatedAt = new Date();

    for (const tab of tabs) {
      const textField = buildTextField(tabData, tab);

      DEMO_MOODS[mood].versions[versionName].categories[tab] = {
        heading: tabData[tab]?.heading || "",
        ...textField,
        voice: tabData[tab]?.voice || null,
        live: !!makeLive,
      };
    }

    console.log("✅ Entry updated (demo):", mood, versionName);
  } catch (err) {
    console.error("❌ updateEntry error (demo):", err);
    throw err;
  }
};
