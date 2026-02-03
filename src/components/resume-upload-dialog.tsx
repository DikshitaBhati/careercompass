'use client';

import { useActionState, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveResumeText } from '@/app/actions';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useFormStatus } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
};

const initialState = { message: '', error: false };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending || disabled}>
      {pending ? 'Uploading...' : 'Upload Resume'}
    </Button>
  );
}

export default function ResumeUploadDialog({
  open,
  onClose,
  onUploadSuccess,
}: Props) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(saveResumeText, initialState);
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    if (open) {
      setSessionId(localStorage.getItem('careercompass_session') ?? '');
    }
  }, [open]);

  useEffect(() => {
    if (!state.message) return;

    toast({
      title: state.error ? 'Upload failed' : 'Resume uploaded',
      description: state.message,
      variant: state.error ? 'destructive' : 'default',
    });

    if (!state.error) {
      onUploadSuccess();
      onClose();
      setFile(null);
    }
  }, [state, toast, onUploadSuccess, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload your resume</DialogTitle>
          <DialogDescription>
            Add your resume once to check job matches.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resume">Resume (PDF)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              name="resume"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
            />
          </div>

          <input type="hidden" name="sessionId" value={sessionId} />

          <SubmitButton disabled={!file || !sessionId} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
