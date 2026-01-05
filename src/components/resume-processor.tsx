'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Check } from 'lucide-react';
import { scoreResumeForJobs } from '@/app/actions';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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

function SubmitButton({
  resume,
  userId,
}: {
  resume: File | null;
  userId?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending || !resume || !userId}
      className="w-full"
    >
      {pending ? 'Analyzing...' : 'Check Match Score'}
      {!pending && <Check className="ml-2 h-4 w-4" />}
    </Button>
  );
}

type ResumeProcessorProps = {
  userId?: string;
  onScoreComplete?: () => void;
};

export default function ResumeProcessor({
  userId,
  onScoreComplete,
}: ResumeProcessorProps) {
  const { toast } = useToast();

  const [state, formAction] = useActionState(
    scoreResumeForJobs,
    initialState
  );

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔹 Prevent repeated toasts + repeated callbacks
  const [hasHandledResult, setHasHandledResult] = useState(false);

  useEffect(() => {
    if (state.message && !hasHandledResult) {
      toast({
        title: state.error ? 'Analysis Failed' : 'Analysis Complete',
        description: state.message,
        variant: state.error ? 'destructive' : 'default',
      });

      setHasHandledResult(true);

      // 🔹 Notify parent ONLY on successful scoring
      if (!state.error) {
        onScoreComplete?.();

        // Reset file input for next upload
        setResumeFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }

    // 🔹 Reset handler when server action state clears
    if (!state.message) {
      setHasHandledResult(false);
    }
  }, [state, toast, hasHandledResult, onScoreComplete]);

  /**
   * 🔹 Reset analysis session when user selects a NEW resume
   */
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);

      // Reset previous analysis session
      setHasHandledResult(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Analysis</CardTitle>
        <CardDescription>
          Upload your resume to see how well you match with the job listings.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resume">Resume (PDF only)</Label>
            <Input
              id="resume"
              name="resume"
              type="file"
              accept=".pdf"
              required
              onChange={handleFileChange}
              ref={fileInputRef}
              className="file:text-primary file:font-semibold"
            />
          </div>

          {userId && (
            <input type="hidden" name="userId" value={userId} />
          )}

          <SubmitButton resume={resumeFile} userId={userId} />
        </form>
      </CardContent>
    </Card>
  );
}
