// src/Components/Parts/demoData.js

// -----------------------------
// Dynamic Users for User Management
// -----------------------------
const USER_NAMES = [
  "Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Hannah",
  "Ian", "Jack", "Kara", "Liam", "Mona", "Nina", "Oscar", "Paul", "Quinn",
  "Rachel", "Steve", "Tina"
];

const NUM_USERS = 50; // number of users to generate

export const DEMO_USERS_BASIC = Array.from({ length: NUM_USERS }, (_, idx) => {
  const userId = `user${idx + 1}`;
  const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)); // last 30 days
  const lastSeen = new Date(createdAt.getTime() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)); // after createdAt
  return { userId, lastSeen, createdAt };
});

// Users for dashboard table
export const DEMO_USERS_TABLE = Array.from({ length: NUM_USERS }, (_, idx) => {
  const id = idx + 1;
  const deviceId = `device-${String(id).padStart(3, "0")}`;
  const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
  const lastSeen = new Date(createdAt.getTime() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
  const status = Math.random() > 0.3; // ~70% active
  return { id, deviceId, lastSeen, createdAt, status };
});

// Sessions
export const DEMO_SESSIONS = {
  Lonely: DEMO_USERS_BASIC.slice(0, 10).map(u => ({ userId: u.userId, timestamp: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)) })),
  Anxious: DEMO_USERS_BASIC.slice(10, 20).map(u => ({ userId: u.userId, timestamp: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)) })),
  Heartbroken: DEMO_USERS_BASIC.slice(20, 30).map(u => ({ userId: u.userId, timestamp: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)) })),
  Lost: DEMO_USERS_BASIC.slice(30, 40).map(u => ({ userId: u.userId, timestamp: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)) })),
};

// Meditation demo
export const DEMO_MEDITATION = {
  id: "meditation-id",
  heading: "Morning Calm, Focus on each breath, letting go of stress and bringing clarity to your mind and body.",
  text: "Take 10 minutes to focus on your breath and start your day peacefully. Sit back, relax, and let go of all your worries as you focus on your breathing. Allow yourself to deeply relax, breathing in serenity and releasing tension with each exhale. Find a peaceful moment, breathing gently to quiet the mind and ease the body into calmness. Focus on each breath, letting go of stress and bringing clarity to your mind and body.",
  audio: "morning-calm.mp3",
  audioUrl: "https://www.example.com/audio/morning-calm.mp3",
};

// Demo moods
export const DEMO_MOODS = {
  happy: {
    versions: {
      v1: {
        live: true,
        createdAt: new Date(),
        categories: {
          affirmation: {
            heading: "Daily Affirmations",
            text1: "I am happy",
            text2: "I radiate positivity",
            voice: "https://example.com/audio1.mp3",
            live: true,
          },
          meditation: {
            heading: "Happy Meditation",
            text: "Breathe and relax",
            voice: null,
            live: true,
          },
        },
      },
    },
  },
  calm: { versions: {} },
};

// -----------------------------
// Dynamic general demo entries
// -----------------------------
const MOODS_LIST = [
  "Lonely", "Anxious", "Heartbroken", "Lost", "Happy", "Calm",
  "Overwhelmed", "Unmotivated", "Guilty", "Insecure"
];

const CATEGORIES_LIST = [
  "affirmation", "miniexercise", "peptalk", "quickreset", "reflections", "voicejourney", "voice"
];

const HEADINGS = [
  "You are loved", "Take a deep breath", "Trust yourself", "Pause for a moment",
  "Reflect and grow", "Positive vibes only", "Focus on your breath"
];

const TEXTS = [
  "Even if you feel alone, remember someone cares.",
  "Breathe in, breathe out, feel the calm.",
  "You have the strength to overcome challenges.",
  "Step away and reset your mind.",
  "Take a moment to reflect on your achievements.",
  "Radiate positivity and happiness today.",
  "Focus on the present, let go of worries."
];

const NUM_ENTRIES = 100; // Number of demo entries to generate

export const DEMO_ENTRIES = Array.from({ length: NUM_ENTRIES }, (_, idx) => {
  const mood = MOODS_LIST[Math.floor(Math.random() * MOODS_LIST.length)];
  const versionId = `v${String(idx + 1).padStart(3, "0")}`;
  const live = Math.random() > 0.5;

  // pick 2-4 random categories
  const categories = CATEGORIES_LIST.sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 3) + 2)
    .map(cat => ({
      categoryName: cat,
      heading: HEADINGS[Math.floor(Math.random() * HEADINGS.length)],
      text: TEXTS[Math.floor(Math.random() * TEXTS.length)],
    }));

  const createdAtSecs =
    Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 10 * 24 * 60 * 60); // last 10 days

  return {
    mood,
    versionId,
    versionData: { live, entryName: `${mood} Entry ${idx + 1}` },
    categories,
    createdAtSecs,
  };
});
