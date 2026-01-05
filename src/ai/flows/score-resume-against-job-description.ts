'use server';

/**
 * @fileOverview Compares a resume against a job description, providing a match score and identifying missing skills.
 *
 * - scoreResumeAgainstJobDescription - A function that handles the resume scoring process.
 * - ScoreResumeAgainstJobDescriptionInput - The input type for the scoreResumeAgainstJobDescription function.
 * - ScoreResumeAgainstJobDescriptionOutput - The return type for the scoreResumeAgainstJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScoreResumeAgainstJobDescriptionInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The extracted text from the resume.'),
  jobDescription: z.string().describe('The job description to compare the resume against.'),
});
export type ScoreResumeAgainstJobDescriptionInput = z.infer<
  typeof ScoreResumeAgainstJobDescriptionInputSchema
>;

const ScoreResumeAgainstJobDescriptionOutputSchema = z.object({
  matchScore: z
    .number()
    .describe('A score between 0 and 100 representing the match between the resume and the job description.'),
  missingSkills: z
    .string()
    .describe('A comma-separated list of skills missing from the resume that are present in the job description.'),
  strengths: z
    .string()
    .describe('A comma-separated list of strengths from the resume that align with the job description.'),
});
export type ScoreResumeAgainstJobDescriptionOutput = z.infer<
  typeof ScoreResumeAgainstJobDescriptionOutputSchema
>;

export async function scoreResumeAgainstJobDescription(
  input: ScoreResumeAgainstJobDescriptionInput
): Promise<ScoreResumeAgainstJobDescriptionOutput> {
  return scoreResumeAgainstJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreResumeAgainstJobDescriptionPrompt',
  input: {schema: ScoreResumeAgainstJobDescriptionInputSchema},
  output: {schema: ScoreResumeAgainstJobDescriptionOutputSchema},
  prompt: `You are a resume screening expert.

You will compare a resume against a job description and provide a match score between 0 and 100.

You will also identify missing skills from the resume that are present in the job description.

Finally, you will identify strengths from the resume that align with the job description.

Resume:
{{resumeText}}

Job Description:
{{jobDescription}}`,
});

const scoreResumeAgainstJobDescriptionFlow = ai.defineFlow(
  {
    name: 'scoreResumeAgainstJobDescriptionFlow',
    inputSchema: ScoreResumeAgainstJobDescriptionInputSchema,
    outputSchema: ScoreResumeAgainstJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
