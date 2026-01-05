# **App Name**: CareerCompass

## Core Features:

- Job Search: Fetch job listings from JSearch RapidAPI based on job title and location using the `/search` endpoint.
- Job Storage: Store job details (title, description, company, location, application URL) in a Firestore collection named 'jobs', using the application URL as the document ID. Also store createdAt timestamp.
- Resume Upload: Allow users to upload a resume in PDF format.
- Resume Text Extraction: Use Gemini AI as a tool to extract text from the uploaded PDF resume for processing.
- Resume Scoring: Compare extracted resume text with job descriptions from Firestore to generate a match score (0-100) and save the results, including missing skills and strengths, in Firestore under 'jobMatches'.
- Job Display: Display job listings with key details (title, company, location, match score) on interactive cards, and an 'Apply Now' button redirects to the original job application URL.
- Authentication: Use Firebase Authentication (anonymous) to authenticate users.

## Style Guidelines:

- Primary color: Deep purple (#673AB7) to convey professionalism and innovation.
- Background color: Light gray (#F0F0F3), nearly desaturated purple, for a clean and modern backdrop.
- Accent color: Soft lavender (#E6E0FF) to highlight interactive elements and provide visual interest.
- Body and headline font: 'Inter', a sans-serif with a modern and neutral appearance that's suitable for both headlines and body text.
- Use clear, professional icons to represent job categories and actions.
- Responsive layout for optimal viewing on all devices.
- Subtle transitions and animations to enhance user experience when displaying job listings and match scores.