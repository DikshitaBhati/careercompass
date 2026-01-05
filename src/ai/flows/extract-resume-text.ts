'use server';

/**
 * @fileOverview A flow to extract text from a resume PDF using Gemini AI.
 *
 * - extractResumeText - A function that handles the resume text extraction process.
 * - ExtractResumeTextInput - The input type for the extractResumeText function.
 * - ExtractResumeTextOutput - The return type for the extractResumeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractResumeTextInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      'A resume PDF file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type ExtractResumeTextInput = z.infer<typeof ExtractResumeTextInputSchema>;

const ExtractResumeTextOutputSchema = z.object({
  extractedText: z.string().describe('The extracted text from the resume PDF.'),
});
export type ExtractResumeTextOutput = z.infer<typeof ExtractResumeTextOutputSchema>;

export async function extractResumeText(input: ExtractResumeTextInput): Promise<ExtractResumeTextOutput> {
  return extractResumeTextFlow(input);
}

const extractResumeTextPrompt = ai.definePrompt({
  name: 'extractResumeTextPrompt',
  input: {schema: ExtractResumeTextInputSchema},
  output: {schema: ExtractResumeTextOutputSchema},
  prompt: `Extract the text from the following resume PDF. Only return the extracted text.\n\nResume PDF: {{media url=resumeDataUri}}`,
});

const extractResumeTextFlow = ai.defineFlow(
  {
    name: 'extractResumeTextFlow',
    inputSchema: ExtractResumeTextInputSchema,
    outputSchema: ExtractResumeTextOutputSchema,
  },
  async input => {
    const {output} = await extractResumeTextPrompt(input);
    return output!;
  }
);
