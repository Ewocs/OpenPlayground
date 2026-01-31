const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function main() {
  const author = process.env.PR_AUTHOR;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;

  // Load existing data
  const dataPath = path.join(__dirname, 'contributor-skills.json');
  let data = {};
  if (fs.existsSync(dataPath)) {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }

  if (!data[author]) {
    data[author] = {
      skills: {},
      prs: [],
      languages: {},
      growth: []
    };
  }

  // Get user's PRs
  const { data: prs } = await octokit.pulls.list({
    owner,
    repo,
    author,
    state: 'closed',
    per_page: 100
  });

  // Analyze PRs
  for (const pr of prs) {
    if (!data[author].prs.find(p => p.number === pr.number)) {
      data[author].prs.push({
        number: pr.number,
        title: pr.title,
        body: pr.body,
        merged: pr.merged_at !== null,
        created: pr.created_at
      });

      // Analyze title and body for skills
      const text = `${pr.title} ${pr.body || ''}`.toLowerCase();
      const skills = analyzeSkills(text);
      Object.keys(skills).forEach(skill => {
        data[author].skills[skill] = (data[author].skills[skill] || 0) + skills[skill];
      });
    }
  }

  // Get user's commits
  const { data: commits } = await octokit.repos.listCommits({
    owner,
    repo,
    author,
    per_page: 100
  });

  // Analyze commit messages
  for (const commit of commits) {
    const message = commit.commit.message.toLowerCase();
    const skills = analyzeSkills(message);
    Object.keys(skills).forEach(skill => {
      data[author].skills[skill] = (data[author].skills[skill] || 0) + skills[skill] * 0.5; // Less weight for commits
    });
  }

  // Get languages from user's repos
  try {
    const { data: userRepos } = await octokit.repos.listForUser({
      username: author,
      type: 'owner',
      per_page: 50
    });

    for (const userRepo of userRepos) {
      if (userRepo.language) {
        data[author].languages[userRepo.language] = (data[author].languages[userRepo.language] || 0) + 1;
      }
    }
  } catch (e) {
    console.log('Could not fetch user repos:', e.message);
  }

  // Update growth
  const now = new Date().toISOString().split('T')[0];
  const todayEntry = data[author].growth.find(g => g.date === now);
  if (!todayEntry) {
    data[author].growth.push({
      date: now,
      prs: data[author].prs.length,
      skills: Object.keys(data[author].skills).length
    });
  }

  // Save data
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  console.log(`Updated skills for ${author}`);
}

function analyzeSkills(text) {
  const skills = {};

  // Define skill keywords
  const skillMap = {
    'react': ['react', 'jsx', 'component', 'frontend', 'ui'],
    'javascript': ['javascript', 'js', 'node', 'npm', 'webpack'],
    'python': ['python', 'django', 'flask', 'pandas', 'numpy'],
    'java': ['java', 'spring', 'maven', 'gradle'],
    'html': ['html', 'css', 'web', 'frontend'],
    'css': ['css', 'scss', 'sass', 'styling'],
    'database': ['sql', 'mysql', 'postgres', 'mongodb', 'database'],
    'api': ['api', 'rest', 'graphql', 'backend'],
    'testing': ['test', 'jest', 'mocha', 'unit test'],
    'ml': ['machine learning', 'ml', 'tensorflow', 'pytorch', 'ai'],
    'git': ['git', 'github', 'version control'],
    'docker': ['docker', 'container', 'kubernetes']
  };

  Object.keys(skillMap).forEach(skill => {
    skillMap[skill].forEach(keyword => {
      if (text.includes(keyword)) {
        skills[skill] = (skills[skill] || 0) + 1;
      }
    });
  });

  return skills;
}

main().catch(console.error);