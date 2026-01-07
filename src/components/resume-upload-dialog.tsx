'use client';

import { useState } from 'react';
import { saveResumeText } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

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

type Props = {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
};

export default function ResumeUploadDialog({
  open,
  onClose,
  onUploadSuccess,
}: Props) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please choose a resume file.',
      });
      return;
    }

    const sessionId = localStorage.getItem('careercompass_session');
    if (!sessionId) {
      toast({
        title: 'Session error',
        description: 'Please refresh the page and try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('sessionId', sessionId);

      const res = await saveResumeText(null, formData);

      if (res.error) {
        throw new Error(res.message);
      }

      toast({
        title: 'Resume uploaded',
        description: 'You can now check resume match.',
      });

      onUploadSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err.message || 'Could not upload resume.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload your resume</DialogTitle>
          <DialogDescription>
            Upload your resume to see how well it matches this job.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resume">Resume (PDF)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
            />
          </div>

          <Button
            className="w-full"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? 'Uploading…' : 'Upload Resume'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
