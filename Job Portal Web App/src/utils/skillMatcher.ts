import type { User } from "../types"

// Default demo baseline skills if a new user has not yet uploaded a resume or added skills
export const DEFAULT_CANDIDATE_SKILLS: string[] = [
  "React",
  "TypeScript",
  "Python",
  "SQL",
  "Cloud",
]

/**
 * Retrieve candidate skills from uploaded resume in storage, user profile, or baseline demo skills
 */
export function getCandidateSkills(user?: User | null): string[] {
  try {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("hirehub_uploaded_resume")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed?.skills) && parsed.skills.length > 0) {
          return parsed.skills
        }
      }
    }
  } catch {
    // ignore parse error
  }

  if (user?.skills && Array.isArray(user.skills) && user.skills.length > 0) {
    return user.skills
  }

  return DEFAULT_CANDIDATE_SKILLS
}

export interface SkillMatchResult {
  matchPercent: number
  matchedSkills: string[]
  missingSkills: string[]
  matchedCount: number
  totalCount: number
  hasResumeOrProfileSkills: boolean
}

/**
 * Normalize and check if a job skill matches a candidate skill with alias recognition
 */
function isSkillEquivalent(jobSkill: string, candidateSkill: string): boolean {
  const j = jobSkill.toLowerCase().trim()
  const c = candidateSkill.toLowerCase().trim()

  if (j === c) return true
  if (j.includes(c) || c.includes(j)) return true

  // Common industry exact synonyms & abbreviations
  const aliases: [string, string][] = [
    ["js", "javascript"],
    ["ts", "typescript"],
    ["py", "python"],
    ["react.js", "react"],
    ["reactjs", "react"],
    ["next.js", "nextjs"],
    ["next.js", "next"],
    ["node.js", "nodejs"],
    ["node.js", "node"],
    ["vue.js", "vue"],
    ["vuejs", "vue"],
    ["golang", "go"],
    ["k8s", "kubernetes"],
    ["postgres", "postgresql"],
    ["tailwindcss", "tailwind"],
  ]

  for (const [a, b] of aliases) {
    if ((j === a && c === b) || (j === b && c === a)) return true
  }

  return false
}

/**
 * Calculate the match percentage and skill breakdown between a job and candidate resume/profile
 */
export function calculateSkillMatch(
  jobSkills: string[] = [],
  customCandidateSkills?: string[],
  user?: User | null,
): SkillMatchResult {
  const candidateSkills =
    customCandidateSkills && customCandidateSkills.length > 0
      ? customCandidateSkills
      : getCandidateSkills(user)

  const hasResumeOrProfileSkills =
    Boolean(user?.skills && user.skills.length > 0) ||
    Boolean(typeof localStorage !== "undefined" && localStorage.getItem("hirehub_uploaded_resume"))

  if (!jobSkills || jobSkills.length === 0) {
    return {
      matchPercent: 85,
      matchedSkills: [],
      missingSkills: [],
      matchedCount: 0,
      totalCount: 0,
      hasResumeOrProfileSkills,
    }
  }

  const matchedSkills: string[] = []
  const missingSkills: string[] = []

  jobSkills.forEach((js) => {
    const matched = candidateSkills.some((cs) => isSkillEquivalent(js, cs))
    if (matched) {
      matchedSkills.push(js)
    } else {
      missingSkills.push(js)
    }
  })

  // Realistic match percentage calculation
  let matchPercent: number
  if (matchedSkills.length === 0) {
    matchPercent = 25
  } else {
    const ratio = matchedSkills.length / jobSkills.length
    matchPercent = Math.min(99, Math.round(40 + ratio * 58))
  }

  return {
    matchPercent,
    matchedSkills,
    missingSkills,
    matchedCount: matchedSkills.length,
    totalCount: jobSkills.length,
    hasResumeOrProfileSkills,
  }
}
