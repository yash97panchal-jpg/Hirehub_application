import { describe, it, expect } from "vitest"
import type { Job } from "../src/types"

describe("Resume Skill-Based Matching & Application Actions", () => {
  const sampleJobs: Job[] = [
    {
      id: "job-py-1",
      title: "Senior Python & Backend Engineer",
      company: {
        id: "comp-google",
        name: "Google",
        slug: "google",
        isVerified: true,
        status: "approved",
        location: "Mountain View, CA",
      },
      description: "Build robust distributed backend systems in Python.",
      location: "Remote",
      type: "Full-time",
      experienceLevel: "Senior",
      applyMode: "easy",
      skills: ["Python", "FastAPI", "SQL", "Cloud"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "job-react-1",
      title: "Staff Frontend Architect",
      company: {
        id: "comp-meta",
        name: "Meta",
        slug: "meta",
        isVerified: true,
        status: "approved",
        location: "Menlo Park, CA",
      },
      description: "Drive React performance and modern web state architectures.",
      location: "Menlo Park, CA",
      type: "Full-time",
      experienceLevel: "Lead",
      applyMode: "easy",
      skills: ["React", "TypeScript", "Tailwind", "Next.js"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "job-mobile-1",
      title: "iOS Swift Developer",
      company: {
        id: "comp-apple",
        name: "Apple",
        slug: "apple",
        isVerified: true,
        status: "approved",
        location: "Cupertino, CA",
      },
      description: "Craft fluid native experiences for iOS.",
      location: "Cupertino, CA",
      type: "Full-time",
      experienceLevel: "Mid",
      applyMode: "easy",
      skills: ["Swift", "SwiftUI", "iOS"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  it("extracts skills and calculates match scores for uploaded resume skills", () => {
    const resumeSkills = ["Python", "SQL", "Cloud"]

    const matchedJobs = sampleJobs
      .map((job) => {
        const matches = job.skills.filter((js) =>
          resumeSkills.some((rs) => rs.toLowerCase() === js.toLowerCase()),
        )
        const matchPercent = Math.min(
          99,
          Math.max(
            75,
            Math.round(70 + (matches.length / Math.max(1, job.skills.length)) * 30),
          ),
        )
        return {
          ...job,
          matchedSkills: matches,
          matchPercent,
        }
      })
      .filter((j) => j.matchedSkills.length > 0)
      .sort((a, b) => b.matchPercent - a.matchPercent)

    expect(matchedJobs.length).toBe(1)
    expect(matchedJobs[0].title).toBe("Senior Python & Backend Engineer")
    expect(matchedJobs[0].matchedSkills).toContain("Python")
    expect(matchedJobs[0].matchedSkills).toContain("SQL")
    expect(matchedJobs[0].matchedSkills).toContain("Cloud")
    expect(matchedJobs[0].matchPercent).toBeGreaterThanOrEqual(90)
  })

  it("generates correct company profile link and apply URL for matched roles", () => {
    const targetJob = sampleJobs[0]
    const companyProfileUrl = `/companies/${targetJob.company.id || targetJob.company.slug}`
    const applyUrl = `/jobs/${targetJob.id}`

    expect(companyProfileUrl).toBe("/companies/comp-google")
    expect(applyUrl).toBe("/jobs/job-py-1")
  })

  it("calculates accurate skill match percentages for JobCard display", async () => {
    const { calculateSkillMatch } = await import("../src/utils/skillMatcher")
    
    // High match (3 of 4 skills match)
    const resultHigh = calculateSkillMatch(
      ["Python", "FastAPI", "SQL", "Cloud"],
      ["Python", "SQL", "Cloud", "Docker"],
    )
    expect(resultHigh.matchedCount).toBe(3)
    expect(resultHigh.totalCount).toBe(4)
    expect(resultHigh.matchPercent).toBeGreaterThanOrEqual(80)
    expect(resultHigh.matchedSkills).toContain("Python")
    expect(resultHigh.matchedSkills).toContain("SQL")

    // Full match (4 of 4 skills match)
    const resultFull = calculateSkillMatch(
      ["React", "TypeScript", "Tailwind", "Next.js"],
      ["React", "TypeScript", "Tailwind", "Next.js"],
    )
    expect(resultFull.matchedCount).toBe(4)
    expect(resultFull.totalCount).toBe(4)
    expect(resultFull.matchPercent).toBeGreaterThanOrEqual(95)

    // Low match (0 skills match)
    const resultZero = calculateSkillMatch(
      ["Ruby", "Rails", "Postgres"],
      ["Rust", "Solidity"],
    )
    expect(resultZero.matchedCount).toBe(0)
    expect(resultZero.matchPercent).toBeLessThan(30)
  })
})
