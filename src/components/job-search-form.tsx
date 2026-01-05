'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Search } from 'lucide-react';
import { searchAndStoreJobs } from '@/app/actions';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';

/**
 * ✅ Server Action initial state
 */
const initialState = {
  message: '',
  error: false,
};

type JobSearchFormProps = {
  onSearchComplete?: () => void;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Searching...' : 'Search Jobs'}
      {!pending && <Search className="ml-2 h-4 w-4" />}
    </Button>
  );
}

export default function JobSearchForm({
  onSearchComplete,
}: JobSearchFormProps) {
  const { toast } = useToast();

  const [state, formAction] = useActionState(
    searchAndStoreJobs,
    initialState
  );

  // 🔹 Handle search result feedback
  const [hasShownToast, setHasShownToast] = useState(false);

useEffect(() => {
  if (state.message && !hasShownToast) {
    toast({
      title: state.error ? 'Search Failed' : 'Search Complete',
      description: state.message,
      variant: state.error ? 'destructive' : 'default',
    });

    setHasShownToast(true);

    if (!state.error) {
      onSearchComplete?.();
    }
  }

  if (!state.message) {
    setHasShownToast(false);
  }
}, [state, toast, onSearchComplete, hasShownToast]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Your Next Role</CardTitle>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4">
          {/* Job title */}
          <div className="space-y-2">
            <Label htmlFor="query">Job Title / Keyword</Label>
            <Input
              id="query"
              name="query"
              placeholder="e.g., Software Engineer"
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., India"
              required
            />
          </div>

          {/* Filters (UI-only, future-ready) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type</Label>
              <select
                id="jobType"
                name="jobType"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All</option>
                <option value="full-time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workMode">Work Mode</Label>
              <select
                id="workMode"
                name="workMode"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
