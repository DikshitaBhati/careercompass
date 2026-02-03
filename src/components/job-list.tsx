'use client';

import type { Job } from '@/lib/types';
import JobCard from './job-card';

type Props = {
  jobs: Job[];
  hasUploadedResume: boolean;
  onResumeUploaded: () => void;
};

export default function JobList({
  jobs,
  hasUploadedResume,
  onResumeUploaded,
}: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-6">
        Job Listings
      </h2>

      {jobs.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No jobs found.</p>
        </div>
      ) : (
        /* 🔹 GRID RESTORED */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              hasUploadedResume={hasUploadedResume}
              onResumeUploaded={onResumeUploaded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
