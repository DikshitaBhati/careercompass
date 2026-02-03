'use client';

import { useState } from 'react';
import { getStoredJobs, searchAndStoreJobs } from '@/app/actions';
import type { Job } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  onSearchComplete: (jobs: Job[]) => void;
};

export default function JobSearchForm({ onSearchComplete }: Props) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('All');
  const [workMode, setWorkMode] = useState('All');
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('query', query);

    // These are UI-only for now (fine for project)
    formData.append('location', location);
    formData.append('jobType', jobType);
    formData.append('workMode', workMode);

    await searchAndStoreJobs(null, formData);
    const storedJobs = await getStoredJobs();

    setLoading(false);
    onSearchComplete(storedJobs);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">
          Find Your Next Role
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job Title */}
        <div>
          <label className="text-sm font-medium">
            Job Title / Keyword
          </label>
          <Input
            placeholder="e.g. Software Engineer"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-medium">
            Location
          </label>
          <Input
            placeholder="e.g. India"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">
              Job Type
            </label>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Full Time">Full Time</SelectItem>
                <SelectItem value="Part Time">Part Time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">
              Work Mode
            </label>
            <Select value={workMode} onValueChange={setWorkMode}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="Onsite">Onsite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Button */}
        <Button
          className="w-full mt-2"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching…' : 'Search Jobs'}
        </Button>
      </CardContent>
    </Card>
  );
}
