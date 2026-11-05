import { describe, it, expect } from "vitest"
import {
  getRoleAndSkillSuggestions,
  getLocationHierarchySuggestions,
} from "../src/data/searchSuggestions"

describe("Search-based Suggestions Engine", () => {
  describe("Role and Skill Suggestions (e.g. Python)", () => {
    it("suggests python roles and skills when typing 'python'", () => {
      const results = getRoleAndSkillSuggestions("python")

      // Role suggestions
      expect(results.roles.length).toBeGreaterThan(0)
      const hasPythonRole = results.roles.some((r) =>
        r.title.toLowerCase().includes("python"),
      )
      expect(hasPythonRole).toBe(true)

      // Skill suggestions
      expect(results.skills.length).toBeGreaterThan(0)
      const hasPythonSkill = results.skills.some((s) =>
        s.name.toLowerCase().includes("python"),
      )
      expect(hasPythonSkill).toBe(true)
    })

    it("suggests react roles and skills when typing 'react'", () => {
      const results = getRoleAndSkillSuggestions("react")
      expect(results.roles.some((r) => r.title.toLowerCase().includes("react"))).toBe(true)
      expect(results.skills.some((s) => s.name.toLowerCase().includes("react"))).toBe(true)
    })

    it("suggests design roles and skills when typing 'design'", () => {
      const results = getRoleAndSkillSuggestions("design")
      expect(results.roles.some((r) => r.title.toLowerCase().includes("design"))).toBe(true)
    })
  })

  describe("3-Tier Location Hierarchy Suggestions (Country -> State -> City)", () => {
    it("suggests Country, Country+State, and Country+State+City for 'India'", () => {
      const results = getLocationHierarchySuggestions("ind")

      // Tier 1: Country
      expect(results.countries.length).toBeGreaterThan(0)
      expect(results.countries.some((c) => c.label === "India")).toBe(true)

      // Tier 2: Country with State
      expect(results.states.length).toBeGreaterThan(0)
      expect(results.states.some((s) => s.label.includes("India"))).toBe(true)

      // Tier 3: Country with State with City
      expect(results.cities.length).toBeGreaterThan(0)
      expect(
        results.cities.some(
          (c) => c.label.includes("India") && c.city && c.state,
        ),
      ).toBe(true)
    })

    it("suggests California and San Francisco hierarchy for 'cal'", () => {
      const results = getLocationHierarchySuggestions("cal")

      // Tier 1: Country
      expect(results.countries.some((c) => c.label === "United States")).toBe(true)

      // Tier 2: Country with State
      expect(
        results.states.some((s) => s.label === "California, United States"),
      ).toBe(true)

      // Tier 3: Country with State with City
      expect(
        results.cities.some(
          (c) => c.label === "San Francisco, California, United States",
        ),
      ).toBe(true)
    })

    it("suggests hierarchy for single word city search 'tokyo'", () => {
      const results = getLocationHierarchySuggestions("tokyo")

      // Tier 1: Country (Japan)
      expect(results.countries.some((c) => c.label === "Japan")).toBe(true)

      // Tier 3: City, State, Country
      expect(results.cities.some((c) => c.city === "Tokyo" && c.country === "Japan")).toBe(true)
    })
  })
})
