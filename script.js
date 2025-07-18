// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const createView = document.getElementById('create-view');
    const incidentView = document.getElementById('incident-view');
    const createIncidentForm = document.getElementById('create-incident-form');
    const passBatonForm = document.getElementById('pass-baton-form');
    const backToHomeBtn = document.getElementById('back-to-home');

    // --- DATA SIMULATION (using localStorage) ---
    let users = [];
    let incidents = [];

    function initializeData() {
        const storedUsers = localStorage.getItem('users');
        const storedIncidents = localStorage.getItem('incidents');

        if (!storedUsers) {
            users = [
                { id: 1, name: 'Alice (Reporter)', skills: ['frontend'] },
                { id: 2, name: 'Bob (DBA)', skills: ['database', 'sql', 'performance'] },
                { id: 3, name: 'Charlie (Auth Expert)', skills: ['auth', 'jwt', 'login', 'security'] },
                { id: 4, name: 'Diana (DevOps)', skills: ['kubernetes', 'docker', 'aws', 'deployment'] },
            ];
            localStorage.setItem('users', JSON.stringify(users));
        } else {
            users = JSON.parse(storedUsers);
        }

        if (!storedIncidents) {
            incidents = [];
            localStorage.setItem('incidents', JSON.stringify(incidents));
        } else {
            incidents = JSON.parse(storedIncidents);
        }
    }

    function findExpert(description) {
        const keywords = description.toLowerCase().split(' ');
        let bestMatch = { score: -1, user: null };

        users.forEach(user => {
            if (user.id === 1) return;
            let score = 0;
            user.skills.forEach(skill => {
                if (keywords.includes(skill)) score++;
            });
            if (score > bestMatch.score) {
                bestMatch = { score, user };
            }
        });
        return bestMatch.user || users.find(u => u.id === 2); // Default to Bob
    }

    // --- VIEW ROUTING ---
    function navigate() {
        const hash = window.location.hash;
        if (hash.startsWith('#incident-')) {
            const incidentId = parseInt(hash.replace('#incident-', ''), 10);
            renderIncidentView(incidentId);
            createView.classList.add('hidden');
            incidentView.classList.remove('hidden');
        } else {
            createView.classList.remove('hidden');
            incidentView.classList.add('hidden');
        }
    }

    // --- RENDER FUNCTIONS ---
    function renderIncidentView(incidentId) {
        const incident = incidents.find(inc => inc.id === incidentId);
        if (!incident) {
            window.location.hash = '';
            return;
        }

        const currentOwner = users.find(u => u.id === incident.currentOwnerId);

        document.getElementById('view-title').textContent = incident.title;
        document.getElementById('view-description').textContent = incident.description;
        document.getElementById('view-owner').textContent = currentOwner.name;
        document.getElementById('view-status').textContent = incident.status;

        const timelineList = document.getElementById('view-timeline-list');
        timelineList.innerHTML = '';
        incident.logs.forEach(log => {
            const li = document.createElement('li');
            const timeSpan = document.createElement('span');
            timeSpan.className = 'time';
            timeSpan.textContent = new Date(log.timestamp).toLocaleTimeString();
            li.appendChild(timeSpan);
            li.append(log.message);
            timelineList.appendChild(li);
        });

        const nextOwnerSelect = document.getElementById('next-owner-select');
        nextOwnerSelect.innerHTML = '';
        users.filter(u => u.id !== 1).forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name} (${user.skills.join(', ')})`;
            nextOwnerSelect.appendChild(option);
        });
    }

    // --- EVENT HANDLERS ---
    createIncidentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('incident-title').value;
        const description = document.getElementById('incident-description').value;
        const expert = findExpert(description);

        const newIncident = {
            id: Date.now(), // Simple unique ID
            title,
            description,
            status: 'open',
            currentOwnerId: expert.id,
            logs: [
                { timestamp: new Date(), message: `Incident created by Alice (Reporter).` },
                { timestamp: new Date(), message: `Baton passed to ${expert.name}.` }
            ]
        };

        incidents.push(newIncident);
        localStorage.setItem('incidents', JSON.stringify(incidents));

        window.location.hash = `#incident-${newIncident.id}`;
        createIncidentForm.reset();
    });

    passBatonForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const incidentId = parseInt(window.location.hash.replace('#incident-', ''), 10);
        const incident = incidents.find(inc => inc.id === incidentId);
        const currentOwner = users.find(u => u.id === incident.currentOwnerId);
        
        const passingNote = document.getElementById('passing-note').value;
        const newOwnerId = parseInt(document.getElementById('next-owner-select').value, 10);
        const newOwner = users.find(u => u.id === newOwnerId);

        incident.logs.push({ timestamp: new Date(), message: `${currentOwner.name} passed baton with note: "${passingNote}"` });
        incident.logs.push({ timestamp: new Date(), message: `Baton passed to ${newOwner.name}.` });
        incident.currentOwnerId = newOwnerId;

        localStorage.setItem('incidents', JSON.stringify(incidents));
        passBatonForm.reset();
        renderIncidentView(incidentId);
    });

    backToHomeBtn.addEventListener('click', () => {
        window.location.hash = '';
    });

    // --- INITIALIZATION ---
    window.addEventListener('hashchange', navigate);
    initializeData();
    navigate(); // Initial page load
});