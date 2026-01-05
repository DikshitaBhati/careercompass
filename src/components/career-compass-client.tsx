'use client';

import { useEffect, useState } from 'react';
import type { Job, JobMatch } from '@/lib/types';
import { useAuth } from './auth-provider';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import JobSearchForm from './job-search-form';
import ResumeProcessor from './resume-processor';
import JobList from './job-list';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

type CareerCompassClientProps = {
  initialJobs: Job[];
};

export default function CareerCompassClient({
  initialJobs,
}: CareerCompassClientProps) {
  /* =======================
     🔹 ALL HOOKS AT TOP
     ======================= */

  const { user, loading: authLoading } = useAuth();

  // UX state
  const [view, setView] = useState<'search' | 'results'>('search');
  const [hasSearched, setHasSearched] = useState(false);
  const [hasUploadedResume, setHasUploadedResume] = useState(false);

  // Data state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scores, setScores] = useState<Record<string, JobMatch>>({});
  const [isClient, setIsClient] = useState(false);

  /* =======================
     🔹 EFFECTS
     ======================= */

  // Ensure client-only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load jobs ONLY after search
  useEffect(() => {
    if (hasSearched) {
      setJobs(initialJobs);
    }
  }, [initialJobs, hasSearched]);

  // Fetch resume match scores
  useEffect(() => {
    if (!user) return;

    const fetchScores = async () => {
      const scoresRef = collection(db, 'jobMatches');
      const q = query(scoresRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const fetchedScores: Record<string, JobMatch> = {};
      querySnapshot.forEach((doc) => {
        const match = doc.data() as JobMatch;
        fetchedScores[match.jobId] = match;
      });

      setScores(fetchedScores);
    };

    fetchScores();
  }, [user]);

  /* =======================
     🔹 DERIVED DATA
     ======================= */

  const combinedJobs = jobs.map((job) => ({
    ...job,
    match: hasUploadedResume ? scores[job.id] : undefined,
  }));

  /* =======================
     🔹 LOADING STATE
     ======================= */

  if (!isClient || authLoading) {
    return (
      <div className="container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3 space-y-8">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================
     🔹 UI
     ======================= */

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 🔹 LEFT SIDEBAR */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
          {view === 'results' && (
            <Button
              variant="outline"
              onClick={() => {
                setView('search');
                setHasSearched(false);
                setHasUploadedResume(false);
                setJobs([]);
              }}
            >
              ← Back to Search
            </Button>
          )}

          <JobSearchForm
            onSearchComplete={() => {
              setHasSearched(true);
              setView('results');
            }}
          />

          <ResumeProcessor
            userId={user?.uid}
            onScoreComplete={() => setHasUploadedResume(true)}
          />
        </aside>

        {/* 🔹 MAIN CONTENT */}
        <section className="lg:col-span-8 xl:col-span-9">
          {!hasSearched ? (
            <div className="flex h-full items-center justify-center text-center text-muted-foreground">
              <p className="text-lg">
                Start by searching for a job to see matching opportunities.
              </p>
            </div>
          ) : (
            <JobList jobs={combinedJobs} />
          )}
        </section>
      </div>
    </div>
  );
}
