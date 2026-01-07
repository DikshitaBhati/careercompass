'use server';

/**
 * ATS-style resume scoring using extended skill taxonomy
 * (Works for ANY job type)
 */
export async function scoreResumeAgainstJobDescription({
  resumeText,
  jobDescription,
}: {
  resumeText: string;
  jobDescription: string;
}): Promise<{
  matchScore: number;
  strengths: string;
  missingSkills: string;
}> {
  const resume = normalize(resumeText);
const job = normalize(jobDescription);


  /* =========================
     UNIVERSAL SKILL BANK
  ========================= */

  const skillGroups: Record<string, string[]> = {
    // 💻 Tech / Software
    tech: [
      'html',
      'css',
      'javascript',
      'typescript',
      'react',
      'next.js',
      'node',
      'express',
      'python',
      'java',
      'php',
      'api',
      'rest',
      'graphql',
      'sql',
      'mongodb',
      'firebase',
      'aws',
      'docker',
      'git',
    ],

    // 🎨 Design / Creative
    design: [
      'ui',
      'ux',
      'figma',
      'adobe',
      'photoshop',
      'illustrator',
      'indesign',
      'wireframe',
      'prototyping',
      'visual design',
      'branding',
      'typography',
      'color theory',
    ],

    // 📊 Data / Analytics
    data: [
      'data analysis',
      'data analytics',
      'power bi',
      'tableau',
      'excel',
      'google sheets',
      'statistics',
      'machine learning',
      'sql',
      'python',
    ],

    // 📢 Marketing / Business
    marketing: [
      'digital marketing',
      'seo',
      'sem',
      'content marketing',
      'email marketing',
      'social media',
      'google ads',
      'facebook ads',
      'market research',
      'branding',
    ],

    // 🏢 Operations / Management
    management: [
      'project management',
      'agile',
      'scrum',
      'kanban',
      'stakeholder management',
      'planning',
      'roadmap',
      'coordination',
      'operations',
    ],

    // 🧠 Soft Skills (VERY IMPORTANT FOR ATS)
    soft: [
      'communication',
      'teamwork',
      'collaboration',
      'problem solving',
      'critical thinking',
      'time management',
      'leadership',
      'adaptability',
      'creativity',
    ],

    // 🧰 Tools & Platforms
    tools: [
      'jira',
      'notion',
      'slack',
      'trello',
      'asana',
      'ms excel',
      'powerpoint',
      'word',
      'google workspace',
    ],
  };

  /* =========================
     MATCHING LOGIC
  ========================= */
  function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.#]/g, ' ')
    .replace(/\s+/g, ' ');
}


  const found: Set<string> = new Set();
  const missing: Set<string> = new Set();

  Object.values(skillGroups).forEach((skills) => {
    skills.forEach((skill) => {
      if (job.includes(skill)) {
        if (resume.includes(skill)) {
          found.add(skill);
        } else {
          missing.add(skill);
        }
      }
    });
  });

  const foundArr = Array.from(found);
  const missingArr = Array.from(missing);

  const total = foundArr.length + missingArr.length;
  const score =
    total === 0 ? 0 : Math.round((foundArr.length / total) * 100);

  return {
    matchScore: score,
    strengths:
      foundArr.length > 0
        ? foundArr.join(', ')
        : 'No strong matches found',
    missingSkills:
      missingArr.length > 0
        ? missingArr.join(', ')
        : 'No major gaps',
  };
}
