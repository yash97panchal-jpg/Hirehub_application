import { describe, it, expect } from "vitest"
import type { Job } from "../src/types"

describe("Map View & Company-Specific Filtering", () => {
  const mockJobsList: Job[] = [
    {
      id: "j-1",
      title: "Senior Cloud Architect",
      company: {
        id: "comp-google",
        name: "Google",
        slug: "google",
        isVerified: true,
        status: "approved",
        location: "Mountain View, CA",
      },
      description: "Design planetary scale infrastructure.",
      location: "Mountain View, CA",
      type: "Full-time",
      experienceLevel: "Senior",
      applyMode: "easy",
      skills: ["Cloud", "Go"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "j-2",
      title: "Staff Payment Infrastructure Engineer",
      company: {
        id: "comp-stripe",
        name: "Stripe",
        slug: "stripe",
        isVerified: true,
        status: "approved",
        location: "San Francisco, CA",
      },
      description: "Build distributed payment ledger engines.",
      location: "San Francisco, CA",
      type: "Full-time",
      experienceLevel: "Senior",
      applyMode: "easy",
      skills: ["Ruby", "TypeScript"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "j-3",
      title: "Frontend Engineer - Search UI",
      company: {
        id: "comp-google",
        name: "Google",
        slug: "google",
        isVerified: true,
        status: "approved",
        location: "Mountain View, CA",
      },
      description: "Optimize user interaction on search results.",
      location: "Mountain View, CA",
      type: "Full-time",
      experienceLevel: "Mid",
      applyMode: "easy",
      skills: ["React", "TypeScript"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  it("filters jobs to display ONLY the clicked company's opening positions", () => {
    const selectedCompany = "Google"

    const filtered = mockJobsList.filter(
      (j) =>
        j.company?.name?.toLowerCase() === selectedCompany.toLowerCase() ||
        j.company?.id === selectedCompany,
    )

    expect(filtered.length).toBe(2)
    expect(filtered.every((j) => j.company.name === "Google")).toBe(true)
    expect(filtered.some((j) => j.company.name === "Stripe")).toBe(false)
  })

  it("shows all companies when company filter is cleared (null)", () => {
    const selectedCompany: string | null = null

    const filtered = !selectedCompany
      ? mockJobsList
      : mockJobsList.filter(
          (j) =>
            j.company?.name?.toLowerCase() === (selectedCompany as string).toLowerCase() ||
            j.company?.id === selectedCompany,
        )

    expect(filtered.length).toBe(3)
  })

  it("filters correctly when clicking another company (e.g. Stripe)", () => {
    const selectedCompany = "Stripe"

    const filtered = mockJobsList.filter(
      (j) =>
        j.company?.name?.toLowerCase() === selectedCompany.toLowerCase() ||
        j.company?.id === selectedCompany,
    )

    expect(filtered.length).toBe(1)
    expect(filtered[0].title).toBe("Staff Payment Infrastructure Engineer")
  })
})
