const express = require('express');
const admin = require('firebase-admin');
const path = require('path');

const app = express();

// 1. FIX: Use absolute path to ensure Render finds the key
const serviceKeyPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = require(serviceKeyPath);

// 2. FIX: Explicitly initialize with the database URL if needed
// (Replace 'your-project-id' with your actual Firebase Project ID from your JSON file)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
}

const db = admin.firestore();

app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// API: Get all skills
app.get('/api/skills', async (req, res) => {
    try {
        const snapshot = await db.collection('skills').get();
        if (snapshot.empty) {
            return res.json([]); // Return empty array if no data exists yet
        }
        const skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(skills);
    } catch (err) {
        console.error("Firebase Read Error:", err);
        res.status(500).send([]); // Send empty array on error so frontend doesn't crash
    }
});

// API: Add a skill
app.post('/api/skills', async (req, res) => {
    try {
        const newSkill = req.body;
        const docRef = await db.collection('skills').add(newSkill);
        res.json({ id: docRef.id });
    } catch (err) {
        console.error("Firebase Write Error:", err);
        res.status(500).json({ error: "Failed to save to database" });
    }
});

// API: Delete a skill
app.delete('/api/skills/:id', async (req, res) => {
    try {
        await db.collection('skills').doc(req.params.id).delete();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Catch-all route to serve the UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});