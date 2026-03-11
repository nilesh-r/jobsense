interface ScoringResult {
  overallScore: number;
  keywordScore: number;
  skillsScore: number;
  experienceScore: number;
  missingKeywords: string[];
  partialMatches: string[];
  suggestions: string[];
}

export function analyzeResume(resumeText: string, jobDescription: string): ScoringResult {
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jobDescription.toLowerCase();

  // Extract keywords from JD (simple approach - can be enhanced)
  const jdWords = jdLower
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);

  // Common tech  // Expanded keyword list for better fallback scoring
  const techKeywords = [
    'javascript', 'typescript', 'python', 'java', 'react', 'node', 'express',
    'sql', 'mongodb', 'postgresql', 'aws', 'docker', 'kubernetes', 'git',
    'html', 'css', 'angular', 'vue', 'nextjs', 'graphql', 'rest', 'api',
    'flutter', 'dart', 'swift', 'kotlin', 'android', 'ios', 'mobile',
    'docker', 'aws', 'azure', 'gcp', 'cloud', 'cicd', 'jenkins', 'github',
    'redis', 'elasticsearch', 'kafka', 'microservices', 'serverless',
    'security', 'testing', 'jest', 'cypress', 'selenium', 'agile', 'scrum',
    'backend', 'frontend', 'fullstack', 'machine learning', 'ai', 'data'
  ];

  // Experience keywords
  const experienceKeywords = [
    'experience', 'years', 'worked', 'developed', 'built', 'managed',
    'led', 'implemented', 'designed', 'architected', 'maintained'
  ];

  // Find matched keywords
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  const partialMatches: string[] = [];

  // Check tech keywords
  jdWords.forEach(word => {
    if (techKeywords.includes(word)) {
      if (resumeLower.includes(word)) {
        matchedKeywords.push(word);
      } else {
        missingKeywords.push(word);
      }
    }
  });

  // Check for partial matches (e.g., "react" vs "reactjs")
  jdWords.forEach(jdWord => {
    if (techKeywords.some(keyword => keyword.includes(jdWord) || jdWord.includes(keyword))) {
      if (!matchedKeywords.includes(jdWord) && !missingKeywords.includes(jdWord)) {
        partialMatches.push(jdWord);
      }
    }
  });

  // Calculate scores
  const totalKeywords = jdWords.filter(w => techKeywords.includes(w)).length || 1;
  const keywordScore = Math.round((matchedKeywords.length / totalKeywords) * 100);

  // Skills score (based on tech keyword matches)
  const skillsScore = keywordScore;

  // Experience score (check for experience indicators)
  const hasExperience = experienceKeywords.some(keyword => resumeLower.includes(keyword));
  const experienceScore = hasExperience ? 80 : 40;

  // Overall score (weighted average) + small variance to avoid constant results
  const baseScore = keywordScore * 0.4 + skillsScore * 0.4 + experienceScore * 0.2;
  const variance = Math.floor(Math.random() * 5) - 2; // -2 to +2
  const overallScore = Math.round(baseScore + variance);

  // Generate suggestions
  const suggestions: string[] = [];
  if (missingKeywords.length > 0) {
    suggestions.push(`Add these keywords to your resume: ${missingKeywords.slice(0, 5).join(', ')}`);
  }
  if (partialMatches.length > 0) {
    suggestions.push(`Consider adding variations: ${partialMatches.slice(0, 3).join(', ')}`);
  }
  if (experienceScore < 60) {
    suggestions.push('Add more experience-related keywords and quantify your achievements');
  }
  if (overallScore < 70) {
    suggestions.push('Review the job description and align your resume keywords more closely');
  }

  return {
    overallScore: Math.min(100, overallScore),
    keywordScore,
    skillsScore,
    experienceScore,
    missingKeywords: missingKeywords.slice(0, 10),
    partialMatches: partialMatches.slice(0, 10),
    suggestions
  };
}

