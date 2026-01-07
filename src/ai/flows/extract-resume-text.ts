'use server';

import { ai } from '@/ai/genkit';

export async function extractResumeText({
  resumeDataUri,
}: {
  resumeDataUri: string;
}): Promise<{ extractedText: string }> {
  const response = await ai.generate({
   model:  'googleai/gemini-1.5-flash',

    prompt: `
You are a document parser.

Extract ALL readable text from the following resume PDF.
Return ONLY plain text.

Resume PDF:
${resumeDataUri}
`,
  });

  if (!response.text) {
    throw new Error('Failed to extract text from resume');
  }

  return {
    extractedText: response.text,
  };
}
