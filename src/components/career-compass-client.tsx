'use client';

import { useEffect, useState } from 'react';
import type { Job } from '@/lib/types';

import JobSearchForm from './job-search-form';
import JobList from './job-list';

import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

type CareerCompassClientProps = {
  initialJobs: Job[];
};

export default function CareerCompassClient({
  initialJobs,
}: CareerCompassClientProps) {
  const [view, setView] = useState<'search' | 'results'>('search');
  const [hasSearched, setHasSearched] = useState(false);
  const [hasUploadedResume, setHasUploadedResume] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Client-only render
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Session ID (no login)
  useEffect(() => {
    let sessionId = localStorage.getItem('careercompass_session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('careercompass_session', sessionId);
    }
  }, []);

  // Load jobs after search
  useEffect(() => {
    if (hasSearched) {
      setJobs(initialJobs);
    }
  }, [initialJobs, hasSearched]);

  if (!isClient) {
    return (
      <div className="container mx-auto p-4 lg:p-8">
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
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

          
        </aside>

        {/* Main */}
        <section className="lg:col-span-8 xl:col-span-9">
          {!hasSearched ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p className="text-lg">
                Start by searching for a job to see matching opportunities.
              </p>
            </div>
          ) : (
            <JobList
              jobs={jobs}
              hasUploadedResume={hasUploadedResume}
            />
          )}
        </section>
      </div>
    </div>
  );
}
