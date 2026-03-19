// ==========================================
// 🌌 PART 1: ASCENDING NEON BOKEH ANIMATION
// ==========================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let orbs = [];
// Matches the exact neon colors from your CSS
const colors = ['#00f0ff', '#8a2be2', '#ff007f']; 

class Orb {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height; 
        this.radius = Math.random() * 4 + 1; 
        this.speedY = Math.random() * 1.5 + 0.2; 
        this.speedX = (Math.random() - 0.5) * 0.5; 
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.6 + 0.1; 
    }
    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        
        // If an orb floats off the top, respawn it at the bottom
        if (this.y + this.radius < 0) {
            this.y = canvas.height + this.radius;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        
        // Add a soft glowing halo around each orb
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        ctx.fill();
        
        ctx.globalAlpha = 1.0; 
        ctx.shadowBlur = 0;    
    }
}

// Spawn 80 glowing orbs
for (let i = 0; i < 80; i++) orbs.push(new Orb());

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    orbs.forEach(orb => { 
        orb.update(); 
        orb.draw(); 
    });
}
animate();

// Fix the canvas if the user resizes their browser window
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


// ==========================================
// 🚀 PART 2: SKILLSWAP APP LOGIC
// ==========================================

// CRITICAL FIX: We changed this to a relative URL so your phone can connect!
const API_URL = '/api/skills';
let allSkills = [];

// Fetch skills from database
async function loadSkills() {
    try {
        const response = await fetch(API_URL);
        allSkills = await response.json();
        renderSkills(allSkills);
    } catch (error) {
        console.error("Error loading skills:", error);
    }
}

// Draw the skills with a staggered animation
function renderSkills(skillsToDisplay) {
    const list = document.getElementById('skillList');
    list.innerHTML = ''; 
    
    skillsToDisplay.forEach((skill, index) => {
        const li = document.createElement('li');
        li.style.animationDelay = `${index * 0.1}s`; 
        
        const rawNumber = skill.whatsappNumber || ""; 
        const cleanNumber = rawNumber.replace(/[^0-9+]/g, '');
        const textMessage = `Hey ${skill.userName}! I saw your SkillSwap post. I'd love to learn ${skill.skillOffered} from you!`;
        const whatsappLink = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(textMessage)}`;

        li.innerHTML = `
            <div>
                <span class="user-name">${skill.userName}</span>
                <span class="badge-teach">TEACHING: ${skill.skillOffered}</span>
                <span style="margin: 0 8px; color: #a1a1aa; font-weight: bold;"> ⇆ </span>
                <span class="badge-learn">LEARNING: ${skill.skillWanted}</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <a href="${whatsappLink}" target="_blank" class="whatsapp-btn">💬 WhatsApp</a>
                <button class="delete-btn" onclick="deleteSkill('${skill.id}')">Delete</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// Real-Time Search Feature
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function(event) {
        const searchTerm = event.target.value.toLowerCase();
        const filteredList = allSkills.filter(skill => {
            return skill.skillOffered.toLowerCase().includes(searchTerm);
        });
        renderSkills(filteredList);
    });
}

// Add a new skill
async function addSkill() {
    const userName = document.getElementById('userName').value;
    const skillOffered = document.getElementById('skillOffered').value;
    const skillWanted = document.getElementById('skillWanted').value;
    const countryCode = document.getElementById('countryCode').value;
    const typedNumber = document.getElementById('whatsappNumber').value; 

    if(!userName || !skillOffered || !skillWanted || !typedNumber) {
        return alert("Please fill out all fields, including your WhatsApp number!");
    }

    const whatsappNumber = countryCode + typedNumber;
    const newSkill = { userName, skillOffered, skillWanted, whatsappNumber };

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkill)
    });

    document.getElementById('userName').value = '';
    document.getElementById('skillOffered').value = '';
    document.getElementById('skillWanted').value = '';
    document.getElementById('whatsappNumber').value = '';

    loadSkills();
}

// Delete a skill
async function deleteSkill(id) {
    if(confirm("Did you find a match? Click OK to remove this swap!")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadSkills();
    }
}

// Enter Key Feature
const inputIds = ['userName', 'skillOffered', 'skillWanted', 'whatsappNumber'];
inputIds.forEach((id, index) => {
    const inputElement = document.getElementById(id);
    if(inputElement) {
        inputElement.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                if (index < inputIds.length - 1) {
                    document.getElementById(inputIds[index + 1]).focus();
                } else {
                    addSkill();
                }
            }
        });
    }
});

// Boot up the app
loadSkills();