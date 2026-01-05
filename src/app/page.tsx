import CareerCompassClient from '@/components/career-compass-client';
import { db } from '@/lib/firebase';
import type { Job } from '@/lib/types';
import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';

async function getJobs(): Promise<Job[]> {
  try {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const jobs: Job[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        title: data.title,
        company: data.company,
        location: data.location,
        description: data.description,
        applyUrl: data.applyUrl,
        // ✅ Convert Firestore Timestamp → plain string
        createdAt: data.createdAt?.seconds
          ? new Date(data.createdAt.seconds * 1000).toISOString()
          : null,
      } as Job;
    });

    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export default async function Home() {
  const initialJobs = await getJobs();

  return <CareerCompassClient initialJobs={initialJobs} />;
}
