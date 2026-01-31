// Contributor Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadContributorData();
});

async function loadContributorData() {
    try {
        // In a real implementation, this would fetch from the server
        // For now, we'll simulate with local data
        const response = await fetch('scripts/contributor-skills.json');
        const data = await response.json();

        // Get current user (in real app, this would be from authentication)
        const username = getCurrentUser();

        if (data[username]) {
            displaySkillProfile(data[username]);
            displayGrowthChart(data[username]);
            displayStats(data[username]);
        }

        // Load recommendations
        loadRecommendations(username);

    } catch (error) {
        console.error('Error loading contributor data:', error);
        showMockData();
    }
}

function getCurrentUser() {
    // In a real app, get from authentication
    // For demo, return a default user
    return 'Gupta-02';
}

function displaySkillProfile(userData) {
    const skills = userData.skills;
    const skillList = document.getElementById('skill-list');

    // Sort skills by level
    const sortedSkills = Object.entries(skills)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

    skillList.innerHTML = sortedSkills.map(([skill, level]) => `
        <div class="skill-item">
            <span class="skill-name">${skill}</span>
            <span class="skill-level">${level.toFixed(1)}</span>
        </div>
    `).join('');

    // Create radar chart
    createRadarChart(skills);
}

function createRadarChart(skills) {
    const ctx = document.getElementById('skill-radar').getContext('2d');

    const topSkills = Object.entries(skills)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6);

    const data = {
        labels: topSkills.map(([skill]) => skill),
        datasets: [{
            label: 'Skill Level',
            data: topSkills.map(([, level]) => level),
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        }]
    };

    new Chart(ctx, {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true
                }
            }
        }
    });
}

function displayGrowthChart(userData) {
    const ctx = document.getElementById('growthChart').getContext('2d');

    const growth = userData.growth;
    if (growth.length === 0) return;

    const data = {
        labels: growth.map(g => g.date),
        datasets: [{
            label: 'PRs Merged',
            data: growth.map(g => g.prs),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
        }, {
            label: 'Skills Learned',
            data: growth.map(g => g.skills),
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            tension: 0.1
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function displayStats(userData) {
    const statsCards = document.getElementById('stats-cards');

    const stats = {
        'Total PRs': userData.prs.length,
        'Skills': Object.keys(userData.skills).length,
        'Languages': Object.keys(userData.languages).length,
        'Growth Days': userData.growth.length
    };

    statsCards.innerHTML = Object.entries(stats).map(([label, value]) => `
        <div class="stat-card">
            <span class="stat-value">${value}</span>
            <div class="stat-label">${label}</div>
        </div>
    `).join('');
}

async function loadRecommendations(username) {
    try {
        // In a real implementation, this would call the recommendation API
        const response = await fetch(`scripts/recommend-issues.js?user=${username}`);
        // For now, show mock recommendations
        showMockRecommendations();
    } catch (error) {
        console.error('Error loading recommendations:', error);
        showMockRecommendations();
    }
}

function showMockRecommendations() {
    const skillIssues = document.getElementById('skill-issues');
    const beginnerIssues = document.getElementById('beginner-issues');

    skillIssues.innerHTML = `
        <h3>Skill-Matched Issues</h3>
        <div class="issue-card">
            <a href="#" class="issue-title">#1234: Improve React component performance</a>
            <div class="issue-meta">Matches: React, JavaScript</div>
        </div>
        <div class="issue-card">
            <a href="#" class="issue-title">#1235: Add API endpoint for user stats</a>
            <div class="issue-meta">Matches: API, Backend</div>
        </div>
    `;

    beginnerIssues.innerHTML = `
        <h3>Beginner-Friendly Issues</h3>
        <div class="issue-card">
            <a href="#" class="issue-title">#1236: Update documentation</a>
            <div class="issue-meta">Good first issue</div>
        </div>
        <div class="issue-card">
            <a href="#" class="issue-title">#1237: Fix typo in README</a>
            <div class="issue-meta">Good first issue</div>
        </div>
    `;
}

function showMockData() {
    // Show sample data when no real data is available
    const mockData = {
        skills: {
            javascript: 15,
            react: 12,
            html: 10,
            css: 8,
            python: 6,
            git: 5
        },
        prs: Array(25).fill({}),
        languages: { JavaScript: 5, HTML: 3, CSS: 3, Python: 2 },
        growth: Array.from({length: 30}, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            prs: Math.floor(Math.random() * 25),
            skills: Math.floor(Math.random() * 10)
        }))
    };

    displaySkillProfile(mockData);
    displayGrowthChart(mockData);
    displayStats(mockData);
    showMockRecommendations();
}