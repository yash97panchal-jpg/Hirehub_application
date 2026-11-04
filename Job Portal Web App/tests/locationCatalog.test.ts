import { describe, it, expect } from "vitest"
import { matchLocationQuery, getMapCoordinatesForQuery, COUNTRIES_CATALOG } from "../src/data/locationCatalog"

describe("Location Catalog & Multi-Country/Multi-State Matching", () => {
  it("matches countries accurately", () => {
    expect(matchLocationQuery("India", "Bengaluru, Karnataka, India")).toBe(true)
    expect(matchLocationQuery("India", "Mumbai, Maharashtra, India")).toBe(true)
    expect(matchLocationQuery("USA", "San Francisco, CA")).toBe(true)
    expect(matchLocationQuery("United States", "Austin, TX")).toBe(true)
    expect(matchLocationQuery("Germany", "Munich, Bavaria, Germany")).toBe(true)
    expect(matchLocationQuery("UK", "London, UK")).toBe(true)
    expect(matchLocationQuery("Japan", "Tokyo, Japan")).toBe(true)
    expect(matchLocationQuery("Australia", "Sydney, Australia")).toBe(true)
    expect(matchLocationQuery("UAE", "Dubai, United Arab Emirates")).toBe(true)
  })

  it("matches Indian states and tech hubs accurately", () => {
    // Karnataka
    expect(matchLocationQuery("Karnataka", "Bengaluru, Karnataka, India")).toBe(true)
    expect(matchLocationQuery("Bengaluru", "Bengaluru, Karnataka, India")).toBe(true)
    expect(matchLocationQuery("Bangalore", "Bengaluru, Karnataka, India")).toBe(true)
    expect(matchLocationQuery("blr", "Bengaluru, Karnataka, India")).toBe(true)

    // Maharashtra
    expect(matchLocationQuery("Maharashtra", "Mumbai, Maharashtra, India")).toBe(true)
    expect(matchLocationQuery("Mumbai", "Mumbai, Maharashtra, India")).toBe(true)
    expect(matchLocationQuery("Pune", "Pune, Maharashtra, India")).toBe(true)

    // Delhi NCR
    expect(matchLocationQuery("Delhi", "Gurugram, Delhi NCR, India")).toBe(true)
    expect(matchLocationQuery("Gurugram", "Gurugram, Delhi NCR, India")).toBe(true)

    // Telangana
    expect(matchLocationQuery("Telangana", "Hyderabad, Telangana, India")).toBe(true)
    expect(matchLocationQuery("Hyderabad", "Hyderabad, Telangana, India")).toBe(true)

    // Tamil Nadu
    expect(matchLocationQuery("Tamil Nadu", "Chennai, Tamil Nadu, India")).toBe(true)
    expect(matchLocationQuery("Chennai", "Chennai, Tamil Nadu, India")).toBe(true)
  })

  it("matches US states and cities accurately", () => {
    // California
    expect(matchLocationQuery("California", "San Francisco, CA")).toBe(true)
    expect(matchLocationQuery("CA", "San Francisco, CA")).toBe(true)
    expect(matchLocationQuery("San Francisco", "San Francisco, CA")).toBe(true)

    // New York
    expect(matchLocationQuery("New York", "New York, NY")).toBe(true)
    expect(matchLocationQuery("NY", "New York, NY")).toBe(true)

    // Texas
    expect(matchLocationQuery("Texas", "Austin, TX")).toBe(true)
    expect(matchLocationQuery("Austin", "Austin, TX")).toBe(true)

    // Washington
    expect(matchLocationQuery("Washington", "Seattle, WA")).toBe(true)
    expect(matchLocationQuery("Seattle", "Seattle, WA")).toBe(true)
  })

  it("returns precise map center coordinates and zoom for queries", () => {
    const blr = getMapCoordinatesForQuery("Bengaluru")
    expect(blr).not.toBeNull()
    expect(blr?.lat).toBeCloseTo(12.9716, 2)
    expect(blr?.lng).toBeCloseTo(77.5946, 2)

    const mum = getMapCoordinatesForQuery("Mumbai")
    expect(mum).not.toBeNull()
    expect(mum?.lat).toBeCloseTo(19.076, 2)

    const us = getMapCoordinatesForQuery("United States")
    expect(us).not.toBeNull()
    expect(us?.zoom).toBe(4)

    const india = getMapCoordinatesForQuery("India")
    expect(india).not.toBeNull()
    expect(india?.zoom).toBe(5)
  })
})
