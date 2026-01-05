'use client';

import type { JobWithMatch } from '@/lib/types';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Briefcase, ExternalLink, MapPin } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

/**
 * 🔹 Helper to detect job platform from URL
 */
function getPlatformName(url: string) {
  if (!url) return 'Company Website';
  if (url.includes('linkedin')) return 'LinkedIn';
  if (url.includes('indeed')) return 'Indeed';
  if (url.includes('glassdoor')) return 'Glassdoor';
  if (url.includes('naukri')) return 'Naukri';
  return 'Company Website';
}

type JobCardProps = {
  job: JobWithMatch;
};

export default function JobCard({ job }: JobCardProps) {
  const score = job.match?.matchScore;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
      {/* 🔹 HEADER */}
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-lg font-bold leading-tight">
            {job.title}
          </CardTitle>

          {score !== undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 flex-shrink-0 cursor-default">
                    <span className="font-semibold text-lg">{score}</span>
                    <div className="w-8 h-8 relative">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          d="M18 2.0845
                             a 15.9155 15.9155 0 0 1 0 31.831
                             a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className={
                            score > 75
                              ? 'text-green-500'
                              : score > 50
                              ? 'text-yellow-500'
                              : 'text-primary'
                          }
                          d="M18 2.0845
                             a 15.9155 15.9155 0 0 1 0 31.831
                             a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={`${score}, 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </TooltipTrigger>

                <TooltipContent>
                  <p className="font-semibold">Match Score: {score}/100</p>
                  {job.match?.strengths && (
                    <p className="text-sm mt-1">
                      <strong>Strengths:</strong> {job.match.strengths}
                    </p>
                  )}
                  {job.match?.missingSkills && (
                    <p className="text-sm mt-1">
                      <strong>Missing:</strong> {job.match.missingSkills}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <CardDescription className="space-y-1 pt-1">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>{job.company}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{job.location}</span>
          </div>
        </CardDescription>
      </CardHeader>

      {/* 🔹 DESCRIPTION */}
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {job.description}
        </p>
      </CardContent>

      {/* 🔹 FOOTER */}
      <CardFooter className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">
          Apply via <strong>{getPlatformName(job.applyUrl)}</strong>
        </span>

        <Button
          asChild
          className="w-full"
          aria-label={`Apply for ${job.title}`}
        >
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Apply Now
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
