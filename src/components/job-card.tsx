'use client';

import { useState } from 'react';
import { ExternalLink, Briefcase, MapPin } from 'lucide-react';
import { scoreResumeForSingleJob } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

import ResumeUploadDialog from './resume-upload-dialog';
import type { Job } from '@/lib/types';

/* ----------------------------------
   Platform name helper
---------------------------------- */
function getPlatformName(url: string) {
  try {
    const host = new URL(url).hostname;
    if (host.includes('indeed')) return 'Indeed';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('shine')) return 'Shine';
    if (host.includes('foundit')) return 'Foundit';
    return host.replace('www.', '');
  } catch {
    return 'Job portal';
  }
}

type Props = {
  job: Job;
  hasUploadedResume: boolean;
  onResumeUploaded: () => void;
};

export default function JobCard({
  job,
  hasUploadedResume,
  onResumeUploaded,
}: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState<{
    matchScore: number;
    strengths: string;
    missingSkills: string;
  } | null>(null);

  const [showUpload, setShowUpload] = useState(false);

  const handleMatch = async () => {
    if (!hasUploadedResume) {
      setShowUpload(true);
      return;
    }

    try {
      setLoading(true);
      const sessionId = localStorage.getItem('careercompass_session')!;
      const result = await scoreResumeForSingleJob(job.id, sessionId);
      setMatch(result);
    } catch (err: any) {
      if (err.message === 'RESUME_NOT_UPLOADED') {
        setShowUpload(true);
      } else {
        toast({
          title: 'Error',
          description: 'Could not analyze resume.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="line-clamp-2">{job.title}</CardTitle>
          <CardDescription className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4" />
              {job.company}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              {job.location}
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-4">
            {job.description}
          </p>

          {match && (
            <>
              <Badge variant="secondary">
                Match: {match.matchScore}%
              </Badge>

              <p className="text-sm">
                <strong>Strengths:</strong> {match.strengths}
              </p>

              <p className="text-sm">
                <strong>Missing skills:</strong> {match.missingSkills}
              </p>
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleMatch}
            disabled={loading}
          >
            {loading
              ? 'Analyzing...'
              : hasUploadedResume
              ? 'View resume match'
              : 'Add resume to check match'}
          </Button>

          <Button asChild className="w-full">
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>

          <span className="text-xs text-muted-foreground text-center">
            {getPlatformName(job.applyUrl)}
          </span>
        </CardFooter>
      </Card>

      <ResumeUploadDialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onUploadSuccess={onResumeUploaded}
      />
    </>
  );
}
