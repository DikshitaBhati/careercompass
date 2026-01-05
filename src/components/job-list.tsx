import type { JobWithMatch } from '@/lib/types';
import JobCard from './job-card';

type JobListProps = {
  jobs: JobWithMatch[];
};

export default function JobList({ jobs }: JobListProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-6">Job Listings</h2>
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No jobs found.</p>
          <p className="text-sm text-muted-foreground/80">Try searching for jobs to get started.</p>
        </div>
      )}
    </div>
  );
}
