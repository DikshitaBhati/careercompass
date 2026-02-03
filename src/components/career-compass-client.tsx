'use client';

import { useEffect, useState } from 'react';
import type { Job } from '@/lib/types';

import JobSearchForm from './job-search-form';
import JobList from './job-list';
import { Button } from './ui/button';

export default function CareerCompassClient() {
  const [view, setView] = useState<'search' | 'results'>('search');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [hasUploadedResume, setHasUploadedResume] = useState(false);

  /* ------------------------------
     Session (no login)
  ------------------------------ */
  useEffect(() => {
    let sessionId = localStorage.getItem('careercompass_session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('careercompass_session', sessionId);
    }
  }, []);

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
                setJobs([]);
              }}
            >
              ← Back to Search
            </Button>
          )}

          <JobSearchForm
            onSearchComplete={(fetchedJobs: Job[]) => {
              setJobs(fetchedJobs);
              setView('results');
            }}
          />
        </aside>

        {/* Main content */}
        <section className="lg:col-span-8 xl:col-span-9">
          {view === 'search' ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p className="text-lg">
                Start by searching for a job to see matching opportunities.
              </p>
            </div>
          ) : (
            <JobList
              jobs={jobs}
              hasUploadedResume={hasUploadedResume}
              onResumeUploaded={() => setHasUploadedResume(true)}
            />
          )}
        </section>
      </div>
    </div>
  );
}
