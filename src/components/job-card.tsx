'use client';

import { useState } from 'react';
import { ExternalLink, Briefcase, MapPin } from 'lucide-react';
import { scoreResumeForSingleJob } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import ResumeUploadDialog from './resume-upload-dialog';

import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from './ui/card';
import type { Job } from '@/lib/types';
function getPlatformName(url: string) {
  try {
    const host = new URL(url).hostname;
    if (host.includes('indeed')) return 'Indeed';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('glassdoor')) return 'Glassdoor';
    return host.replace('www.', '');
  } catch {
    return 'Job portal';
  }
}


export default function JobCard({ job }: { job: Job }) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  const handleCheckMatch = async () => {
    if (!hasResume) {
      setShowUpload(true);
      return;
    }

    try {
      setLoading(true);
      const sessionId = localStorage.getItem('careercompass_session')!;
      const result = await scoreResumeForSingleJob(job.id, sessionId);
      setMatch(result);
    } catch (e: any) {
      toast({
        title: 'Unable to analyze',
        description: 'Please upload your resume first.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
          <CardDescription>
            <div className="flex gap-2 text-sm">
              <Briefcase className="h-4 w-4" /> {job.company}
            </div>
            <div className="flex gap-2 text-sm">
              <MapPin className="h-4 w-4" /> {job.location}
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {job.description}
          </p>

          {match && (
            <>
              <Badge variant="secondary">
                Match: {match.matchScore}%
              </Badge>
              <p className="text-sm">
                <b>Strengths:</b> {match.strengths}
              </p>
              <p className="text-sm">
                <b>Missing skills:</b> {match.missingSkills}
              </p>
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {/* Secondary CTA */}
          <Button
            variant="outline"
            onClick={handleCheckMatch}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'View resume match'}
          </Button>
          
          {/* Primary CTA */}
         <Button asChild className="w-full">
    <a
      href={job.applyUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      Apply
    </a>
  </Button>

  {/* Platform label */}
  <a
    href={job.applyUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:underline"
  >
    {getPlatformName(job.applyUrl)}
    <ExternalLink className="h-3 w-3" />
  </a>

        </CardFooter>
      </Card>

      <ResumeUploadDialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onUploadSuccess={() => setHasResume(true)}
      />
    </>
  );
}
