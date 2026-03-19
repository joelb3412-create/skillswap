const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin'); // The Firebase tool for Node.js

// 1. Load your secret VIP pass
const serviceAccount = require('./serviceAccountKey.json');

// 2. Initialize Firebase securely
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // 🛑 PASTE YOUR DATABASE URL HERE:
  databaseURL: "https://skillswap-app-2994c-default-rtdb.firebaseio.com/" 
});

// 3. Connect to the Realtime Database
const db = admin.database();

const app = express();
app.use(cors());
app.use(express.json());

// --- APP ROUTES ---

// ROUTE 1: Save a new skill to the database (POST)
app.post('/api/skills', async (req, res) => {
    try {
        const newSkill = req.body; // The data sent from your frontend
        
        // Go to the 'skills' folder in your database and push new data
        const skillsRef = db.ref('skills');
        const newSkillRef = skillsRef.push(); // Generates a unique ID
        await newSkillRef.set(newSkill);
        
        console.log("New skill saved!");
        res.status(201).json({ message: "Skill added successfully!" });
    } catch (error) {
        console.error("Error saving skill:", error);
        res.status(500).json({ error: "Failed to add skill" });
    }
});

// ROUTE 2: Get all skills from the database (GET)
app.get('/api/skills', async (req, res) => {
    try {
        const skillsRef = db.ref('skills');
        const snapshot = await skillsRef.once('value'); // Grab the data once
        const data = snapshot.val();
        
        // Firebase returns an object, but frontends prefer arrays. Let's convert it:
        const skillsList = [];
        for (let id in data) {
            skillsList.push({ id: id, ...data[id] });
        }

        res.status(200).json(skillsList);
    } catch (error) {
        console.error("Error fetching skills:", error);
        res.status(500).json({ error: "Failed to fetch skills" });
    }
});
// ROUTE 3: Delete a skill from the database (DELETE)
app.delete('/api/skills/:id', async (req, res) => {
    try {
        const skillId = req.params.id; 
        // Find that specific ID in Firebase and remove it!
        await db.ref('skills/' + skillId).remove();
        res.status(200).json({ message: "Skill deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete skill" });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});