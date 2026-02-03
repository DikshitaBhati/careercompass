'use server';

/* =====================================================
   IN-MEMORY STORES (SESSION-BASED)
   ⚠️ Reset on server restart – OK for demo/project
===================================================== */

type Job = {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  applyUrl: string;
};

const jobStore: Job[] = [];
const resumeStore = new Map<string, string>(); // sessionId → resume text

/* =====================================================
   JOB SEARCH (RAPIDAPI JSEARCH)
===================================================== */

export async function searchAndStoreJobs(
  _prevState: any,
  formData: FormData
): Promise<{ message: string; error?: boolean }> {
  const query = formData.get('query') as string;

  if (!query) {
    return { message: 'Please enter a job title.', error: true };
  }

  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) {
    return { message: 'Job API key missing.', error: true };
  }

  const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
    query
  )}&country=IN&num_pages=1`;

  try {
    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return { message: 'Job provider error.', error: true };
    }

    const data = await res.json();

    jobStore.length = 0; // clear previous jobs

    data.data?.forEach((job: any) => {
      if (!job.job_apply_link) return;

      jobStore.push({
        id: job.job_apply_link,
        title: job.job_title || 'Untitled Role',
        description: job.job_description || '',
        company: job.employer_name || 'Unknown Company',
        location:
          [job.job_city, job.job_state, job.job_country]
            .filter(Boolean)
            .join(', ') || 'India',
        applyUrl: job.job_apply_link,
      });
    });

    return {
      message: `Found ${jobStore.length} jobs.`,
    };
  } catch (err) {
    console.error('Job search error:', err);
    return { message: 'Failed to fetch jobs.', error: true };
  }
}

/* =====================================================
   GET STORED JOBS (USED BY CLIENT)
===================================================== */

export async function getStoredJobs(): Promise<Job[]> {
  return jobStore;
}

/* =====================================================
   RESUME UPLOAD (PLAIN TEXT EXTRACT)
===================================================== */

export async function saveResumeText(
  _prevState: any,
  formData: FormData
): Promise<{ message: string; error?: boolean }> {
  const file = formData.get('resume') as File | null;
  const sessionId = formData.get('sessionId') as string | null;

  if (!file || !sessionId) {
    return { message: 'Resume or session missing.', error: true };
  }

  try {
    const text = await file.text();

    resumeStore.set(sessionId, text.toLowerCase());

    return { message: 'Resume uploaded successfully.' };
  } catch (err) {
    console.error('Resume upload error:', err);
    return { message: 'Failed to upload resume.', error: true };
  }
}

/* =====================================================
   ATS-STYLE RESUME MATCH (NO AI)
===================================================== */

function extractKeywords(text: string): string[] {
  const stopwords = new Set([
    'and','or','with','for','the','a','an','to','of','in','on',
    'is','are','we','you','your','will','be','as','by','from',
    'this','that','at','it','our','their','they','who'
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word));
}

export async function scoreResumeForSingleJob(
  jobId: string,
  sessionId: string
) {
  const resumeText = resumeStore.get(sessionId);
  if (!resumeText) {
    throw new Error('RESUME_NOT_UPLOADED');
  }

  const job = jobStore.find(j => j.id === jobId);
  if (!job) {
    throw new Error('JOB_NOT_FOUND');
  }

  const resume = resumeText.toLowerCase();
  const jobDesc = job.description.toLowerCase();

  const jobKeywords = extractKeywords(jobDesc);

  const softSkills = [
    'communication','teamwork','leadership',
    'problem','management','collaboration'
  ];

  let matchedWeight = 0;
  let totalWeight = 0;

  const matched: string[] = [];
  const missing: string[] = [];

  jobKeywords.forEach(keyword => {
    let weight = 2;

    if (softSkills.includes(keyword)) weight = 1;
    if (['experience','skills','knowledge','design','development'].includes(keyword))
      weight = 3;

    totalWeight += weight;

    if (resume.includes(keyword)) {
      matchedWeight += weight;
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  const score =
    totalWeight === 0
      ? 0
      : Math.min(100, Math.round((matchedWeight / totalWeight) * 100));

  return {
    matchScore: score,
    strengths:
      matched.length ? [...new Set(matched)].slice(0, 10).join(', ') : 'No strong matches found',
    missingSkills:
      missing.length ? [...new Set(missing)].slice(0, 10).join(', ') : 'No major gaps',
  };
}
