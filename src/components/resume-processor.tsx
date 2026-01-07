'use client';

import { useActionState, useRef, useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { saveResumeText } from '@/app/actions';

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
import { useFormStatus } from 'react-dom';

const initialState = { message: '', error: false };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full">
      {pending ? 'Uploading...' : 'Upload Resume'}
      {!pending && <Upload className="ml-2 h-4 w-4" />}
    </Button>
  );
}

export default function ResumeProcessor({
  onUploadComplete,
}: {
  onUploadComplete?: () => void;
}) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(saveResumeText, initialState);
  const [file, setFile] = useState<File | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.error ? 'Upload failed' : 'Resume uploaded',
        description: state.message,
        variant: state.error ? 'destructive' : 'default',
      });

      if (!state.error) {
        onUploadComplete?.();
        setFile(null);
        if (ref.current) ref.current.value = '';
      }
    }
  }, [state, toast, onUploadComplete]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume</CardTitle>
        <CardDescription>
          Upload once to check resume match for jobs
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4">
          <Label>Resume (PDF)</Label>
          <Input
            ref={ref}
            type="file"
            name="resume"
            accept=".pdf"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <input
            type="hidden"
            name="sessionId"
            value={localStorage.getItem('careercompass_session') ?? ''}
          />

          <SubmitButton disabled={!file} />
        </form>
      </CardContent>
    </Card>
  );
}
