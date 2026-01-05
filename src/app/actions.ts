'use server';

import { revalidatePath } from 'next/cache';
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { createHash } from 'crypto';
import { db } from '@/lib/firebase';
import type { Job } from '@/lib/types';
import { extractResumeText } from '@/ai/flows/extract-resume-text';
import { scoreResumeAgainstJobDescription } from '@/ai/flows/score-resume-against-job-description';

/**
 * Helper to create a stable hash for job IDs
 */
function hashString(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * SEARCH JOBS USING JSEARCH + STORE IN FIRESTORE
 */
export async function searchAndStoreJobs(
  prevState: any,
  formData: FormData
): Promise<{ message: string; error?: boolean }> {
  console.log("🔥 searchAndStoreJobs triggered");

  const query = formData.get('query') as string;
  const location = formData.get('location') as string;

  if (!query) {
    return {
      message: 'Please provide a job title.',
      error: true,
    };
  }

  const jsearchApiKey = process.env.JSEARCH_API_KEY;
  if (!jsearchApiKey) {
    console.error('❌ JSEARCH_API_KEY is not set');
    return { message: 'Server configuration error.', error: true };
  }

  // ✅ Proven working JSearch format
  const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
    query
  )}&country=IN&num_pages=1`;

  try {
    console.log("🌍 Fetching from JSearch:", url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': jsearchApiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
  const text = await response.text();
  console.error("❌ JSearch HTTP error:", response.status, text);
  return { message: `Job provider error: ${response.status}`, error: true };
}


    const result = await response.json();
    console.log("📦 JSearch response:", result);

    if (!Array.isArray(result.data) || result.data.length === 0) {
      return { message: 'No jobs found for your search criteria.' };
    }

    const batch = writeBatch(db);
    let jobsAdded = 0;

    for (const job of result.data) {
      if (!job.job_apply_link) continue;

      const jobId = hashString(job.job_apply_link);
      const jobRef = doc(db, 'jobs', jobId);

      const newJob: Omit<Job, 'id'> = {
        title: job.job_title || 'Untitled Role',
        description: job.job_description || '',
        company: job.employer_name || 'Unknown Company',
        location: [
          job.job_city,
          job.job_state,
          job.job_country,
        ].filter(Boolean).join(', '),
        applyUrl: job.job_apply_link,
        createdAt: serverTimestamp(),
      };

      batch.set(jobRef, newJob, { merge: true });
      jobsAdded++;
    }

    if (jobsAdded === 0) {
      return { message: 'No valid jobs found to store.' };
    }

    await batch.commit();
    console.log(`✅ ${jobsAdded} jobs written to Firestore`);

    revalidatePath('/');

    return { message: `Found and stored ${jobsAdded} jobs.` };
  } catch (error) {
    console.error('❌ Error fetching or storing jobs:', error);
    return {
      message: 'Failed to fetch jobs. Please try again later.',
      error: true,
    };
  }
}

/**
 * SCORE RESUME AGAINST STORED JOBS
 */
export async function scoreResumeForJobs(
  prevState: any,
  formData: FormData
): Promise<{ message: string; error?: boolean }> {
  const resumeFile = formData.get('resume') as File;
  const userId = formData.get('userId') as string;

  if (!resumeFile || resumeFile.size === 0) {
    return { message: 'Please upload a resume.', error: true };
  }

  if (!userId) {
    return { message: 'User not authenticated.', error: true };
  }

  try {
    const bytes = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const resumeDataUri = `data:${resumeFile.type};base64,${buffer.toString(
      'base64'
    )}`;

    const { extractedText } = await extractResumeText({ resumeDataUri });

    if (!extractedText) {
      return {
        message: 'Could not extract text from resume.',
        error: true,
      };
    }

    const jobsSnapshot = await getDocs(collection(db, 'jobs'));
    if (jobsSnapshot.empty) {
      return {
        message: 'No jobs found in the database to score against.',
        error: true,
      };
    }

    const batch = writeBatch(db);
    let scoresCalculated = 0;

    for (const jobDoc of jobsSnapshot.docs) {
      const job = jobDoc.data() as Job;

      const { matchScore, missingSkills, strengths } =
        await scoreResumeAgainstJobDescription({
          resumeText: extractedText,
          jobDescription: job.description,
        });

      const matchId = `${userId}_${jobDoc.id}`;
      const matchRef = doc(db, 'jobMatches', matchId);

      batch.set(matchRef, {
        userId,
        jobId: jobDoc.id,
        matchScore,
        missingSkills,
        strengths,
        createdAt: serverTimestamp(),
      });

      scoresCalculated++;
    }

    await batch.commit();
    revalidatePath('/');

    return {
      message: `Successfully scored resume against ${scoresCalculated} jobs.`,
    };
  } catch (error) {
    console.error('Error scoring resume:', error);
    return {
      message: 'An error occurred while scoring your resume.',
      error: true,
    };
  }
}
