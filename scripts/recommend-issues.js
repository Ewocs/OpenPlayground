const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function recommendIssues(username) {
  const dataPath = path.join(__dirname, 'contributor-skills.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  if (!data[username]) {
    return { recommendations: [], beginner: true };
  }

  const userSkills = data[username].skills;
  const topSkills = Object.keys(userSkills).sort((a, b) => userSkills[b] - userSkills[a]).slice(0, 3);

  // Get open issues
  const owner = process.env.REPO_OWNER || 'Gupta-02';
  const repo = process.env.REPO_NAME || 'OpenPlayground';

  const { data: issues } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'open',
    labels: 'good first issue',
    per_page: 20
  });

  const recommendations = [];
  const beginnerIssues = [];

  for (const issue of issues) {
    const text = `${issue.title} ${issue.body || ''}`.toLowerCase();
    let score = 0;
    const matchedSkills = [];

    topSkills.forEach(skill => {
      if (text.includes(skill)) {
        score += userSkills[skill];
        matchedSkills.push(skill);
      }
    });

    if (score > 0) {
      recommendations.push({
        number: issue.number,
        title: issue.title,
        score,
        matchedSkills,
        url: issue.html_url
      });
    } else if (issue.labels.some(l => l.name === 'good first issue')) {
      beginnerIssues.push({
        number: issue.number,
        title: issue.title,
        url: issue.html_url
      });
    }
  }

  // Sort recommendations by score
  recommendations.sort((a, b) => b.score - a.score);

  return {
    recommendations: recommendations.slice(0, 5),
    beginner: beginnerIssues.slice(0, 3),
    topSkills
  };
}

// For testing
if (require.main === module) {
  const username = process.argv[2] || 'Gupta-02';
  recommendIssues(username).then(result => {
    console.log(`Recommendations for ${username}:`);
    console.log('Top skills:', result.topSkills);
    console.log('Skill-matched issues:');
    result.recommendations.forEach(r => console.log(`  #${r.number}: ${r.title} (score: ${r.score})`));
    console.log('Beginner issues:');
    result.beginner.forEach(b => console.log(`  #${b.number}: ${b.title}`));
  }).catch(console.error);
}

module.exports = { recommendIssues };