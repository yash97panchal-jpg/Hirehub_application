export interface LocationHub {
  name: string
  query: string
  city: string
  state?: string
  country: string
  lat: number
  lng: number
  zoom: number
  badge?: string
}

export interface CountryRegion {
  name: string
  code: string
  lat: number
  lng: number
  zoom: number
  states: { name: string; code: string; lat: number; lng: number; zoom: number }[]
}

export const COUNTRIES_CATALOG: CountryRegion[] = [
  {
    name: "India",
    code: "IN",
    lat: 20.5937,
    lng: 78.9629,
    zoom: 5,
    states: [
      { name: "Karnataka", code: "KA", lat: 12.9716, lng: 77.5946, zoom: 10 },
      { name: "Maharashtra", code: "MH", lat: 19.076, lng: 72.8777, zoom: 9 },
      { name: "Delhi NCR", code: "DL", lat: 28.6139, lng: 77.209, zoom: 10 },
      { name: "Telangana", code: "TS", lat: 17.385, lng: 78.4867, zoom: 10 },
      { name: "Tamil Nadu", code: "TN", lat: 13.0827, lng: 80.2707, zoom: 10 },
      { name: "Gujarat", code: "GJ", lat: 23.0225, lng: 72.5714, zoom: 10 },
    ],
  },
  {
    name: "United States",
    code: "US",
    lat: 37.0902,
    lng: -95.7129,
    zoom: 4,
    states: [
      { name: "California", code: "CA", lat: 37.7749, lng: -122.4194, zoom: 8 },
      { name: "New York", code: "NY", lat: 40.7128, lng: -74.006, zoom: 9 },
      { name: "Texas", code: "TX", lat: 30.2672, lng: -97.7431, zoom: 8 },
      { name: "Washington", code: "WA", lat: 47.6062, lng: -122.3321, zoom: 8 },
      { name: "Massachusetts", code: "MA", lat: 42.3601, lng: -71.0589, zoom: 9 },
      { name: "Illinois", code: "IL", lat: 41.8781, lng: -87.6298, zoom: 9 },
    ],
  },
  {
    name: "United Kingdom",
    code: "UK",
    lat: 55.3781,
    lng: -3.436,
    zoom: 6,
    states: [
      { name: "London", code: "LDN", lat: 51.5074, lng: -0.1278, zoom: 11 },
      { name: "Greater Manchester", code: "MAN", lat: 53.4808, lng: -2.2426, zoom: 11 },
    ],
  },
  {
    name: "Germany",
    code: "DE",
    lat: 51.1657,
    lng: 10.4515,
    zoom: 6,
    states: [
      { name: "Berlin", code: "BER", lat: 52.52, lng: 13.405, zoom: 11 },
      { name: "Bavaria", code: "BY", lat: 48.1351, lng: 11.582, zoom: 9 },
    ],
  },
  {
    name: "Japan",
    code: "JP",
    lat: 36.2048,
    lng: 138.2529,
    zoom: 6,
    states: [
      { name: "Tokyo", code: "TYO", lat: 35.6762, lng: 139.6503, zoom: 11 },
      { name: "Osaka", code: "OSA", lat: 34.6937, lng: 135.5023, zoom: 11 },
    ],
  },
  {
    name: "Singapore",
    code: "SG",
    lat: 1.3521,
    lng: 103.8198,
    zoom: 11,
    states: [
      { name: "Central", code: "SG-C", lat: 1.2804, lng: 103.854, zoom: 12 },
    ],
  },
  {
    name: "Australia",
    code: "AU",
    lat: -25.2744,
    lng: 133.7751,
    zoom: 4,
    states: [
      { name: "New South Wales", code: "NSW", lat: -33.8688, lng: 151.2093, zoom: 9 },
      { name: "Victoria", code: "VIC", lat: -37.8136, lng: 144.9631, zoom: 9 },
    ],
  },
  {
    name: "Canada",
    code: "CA",
    lat: 56.1304,
    lng: -106.3468,
    zoom: 4,
    states: [
      { name: "Ontario", code: "ON", lat: 43.6532, lng: -79.3832, zoom: 9 },
      { name: "British Columbia", code: "BC", lat: 49.2827, lng: -123.1207, zoom: 9 },
    ],
  },
  {
    name: "Switzerland",
    code: "CH",
    lat: 46.8182,
    lng: 8.2275,
    zoom: 7,
    states: [
      { name: "Zurich", code: "ZH", lat: 47.3769, lng: 8.5417, zoom: 11 },
      { name: "Geneva", code: "GE", lat: 46.2044, lng: 6.1432, zoom: 11 },
    ],
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    lat: 23.4241,
    lng: 53.8478,
    zoom: 7,
    states: [
      { name: "Dubai", code: "DXB", lat: 25.2048, lng: 55.2708, zoom: 11 },
      { name: "Abu Dhabi", code: "AUH", lat: 24.4539, lng: 54.3773, zoom: 11 },
    ],
  },
]

export const ALL_LOCATION_HUBS: LocationHub[] = [
  { name: "All Worldwide", query: "", city: "Worldwide", country: "Global", lat: 25, lng: 10, zoom: 2 },

  // India
  { name: "Bengaluru, Karnataka", query: "Bengaluru", city: "Bengaluru", state: "Karnataka", country: "India", lat: 12.9716, lng: 77.5946, zoom: 12, badge: "Silicon Valley of India" },
  { name: "Mumbai, Maharashtra", query: "Mumbai", city: "Mumbai", state: "Maharashtra", country: "India", lat: 19.076, lng: 72.8777, zoom: 12, badge: "Fintech Capital" },
  { name: "Pune, Maharashtra", query: "Pune", city: "Pune", state: "Maharashtra", country: "India", lat: 18.5204, lng: 73.8567, zoom: 12, badge: "Software Hub" },
  { name: "Delhi NCR / Gurugram", query: "Delhi NCR", city: "Delhi", state: "Delhi NCR", country: "India", lat: 28.6139, lng: 77.209, zoom: 12, badge: "Enterprise Hub" },
  { name: "Hyderabad, Telangana", query: "Hyderabad", city: "Hyderabad", state: "Telangana", country: "India", lat: 17.385, lng: 78.4867, zoom: 12, badge: "Cyberabad" },
  { name: "Chennai, Tamil Nadu", query: "Chennai", city: "Chennai", state: "Tamil Nadu", country: "India", lat: 13.0827, lng: 80.2707, zoom: 12, badge: "SaaS Capital" },

  // USA
  { name: "San Francisco, CA", query: "San Francisco", city: "San Francisco", state: "California", country: "United States", lat: 37.7749, lng: -122.4194, zoom: 12, badge: "AI Capital" },
  { name: "New York, NY", query: "New York", city: "New York", state: "New York", country: "United States", lat: 40.7128, lng: -74.006, zoom: 12, badge: "Wall St & Media" },
  { name: "Austin, TX", query: "Austin", city: "Austin", state: "Texas", country: "United States", lat: 30.2672, lng: -97.7431, zoom: 12, badge: "Silicon Hills" },
  { name: "Seattle, WA", query: "Seattle", city: "Seattle", state: "Washington", country: "United States", lat: 47.6062, lng: -122.3321, zoom: 12, badge: "Cloud Hub" },
  { name: "Boston, MA", query: "Boston", city: "Boston", state: "Massachusetts", country: "United States", lat: 42.3601, lng: -71.0589, zoom: 12, badge: "Biotech Hub" },
  { name: "Chicago, IL", query: "Chicago", city: "Chicago", state: "Illinois", country: "United States", lat: 41.8781, lng: -87.6298, zoom: 12, badge: "Fintech Hub" },

  // UK & Europe
  { name: "London, UK", query: "London", city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278, zoom: 12, badge: "European Tech Leader" },
  { name: "Berlin, Germany", query: "Berlin", city: "Berlin", state: "Berlin", country: "Germany", lat: 52.52, lng: 13.405, zoom: 12, badge: "Startup Capital" },
  { name: "Munich, Germany", query: "Munich", city: "Munich", state: "Bavaria", country: "Germany", lat: 48.1351, lng: 11.582, zoom: 12, badge: "Engineering Hub" },
  { name: "Zurich, Switzerland", query: "Zurich", city: "Zurich", country: "Switzerland", lat: 47.3769, lng: 8.5417, zoom: 12, badge: "DeepTech & Finance" },

  // Asia-Pacific & Others
  { name: "Singapore", query: "Singapore", city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, zoom: 12, badge: "APAC Gateway" },
  { name: "Tokyo, Japan", query: "Tokyo", city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, zoom: 12, badge: "Robotics & Hardware" },
  { name: "Sydney, Australia", query: "Sydney", city: "Sydney", state: "New South Wales", country: "Australia", lat: -33.8688, lng: 151.2093, zoom: 12, badge: "Pacific Tech Hub" },
  { name: "Toronto, Canada", query: "Toronto", city: "Toronto", state: "Ontario", country: "Canada", lat: 43.6532, lng: -79.3832, zoom: 12, badge: "Canada Tech Capital" },
  { name: "Dubai, UAE", query: "Dubai", city: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708, zoom: 12, badge: "Middle East Hub" },
]

/**
 * Intelligent location query matching function
 * Evaluates city, state names, state abbreviations, country names, and common aliases.
 */
export function matchLocationQuery(query: string, locationStr: string, addressStr?: string): boolean {
  if (!query || !query.trim()) return true
  const q = query.toLowerCase().trim()
  const loc = (locationStr || "").toLowerCase()
  const addr = (addressStr || "").toLowerCase()
  const combined = `${loc} ${addr}`

  // Direct substring check
  if (combined.includes(q)) return true

  // Composite multi-tier query check (e.g. "Bengaluru, Karnataka, India" or "California, United States")
  const parts = q.split(/[,]/).map((p) => p.trim()).filter((p) => p.length >= 2)
  if (parts.length > 1) {
    if (parts.some((part) => combined.includes(part))) return true
  }

  // Country Aliases & Groupings
  if (q === "india" || q === "in") {
    return combined.includes("india") || combined.includes("bengaluru") || combined.includes("bangalore") ||
      combined.includes("mumbai") || combined.includes("pune") || combined.includes("delhi") ||
      combined.includes("gurugram") || combined.includes("hyderabad") || combined.includes("chennai") ||
      combined.includes("karnataka") || combined.includes("maharashtra") || combined.includes("telangana")
  }

  if (q === "united states" || q === "usa" || q === "us") {
    return combined.includes("usa") || combined.includes("united states") || combined.includes("san francisco") ||
      combined.includes("new york") || combined.includes("austin") || combined.includes("seattle") ||
      combined.includes("boston") || combined.includes("chicago") || combined.includes(", ca") ||
      combined.includes(", ny") || combined.includes(", tx") || combined.includes(", wa") ||
      combined.includes(", ma") || combined.includes(", il")
  }

  if (q === "united kingdom" || q === "uk" || q === "britain" || q === "england") {
    return combined.includes("uk") || combined.includes("united kingdom") || combined.includes("london") || combined.includes("manchester")
  }

  if (q === "germany" || q === "de" || q === "deutschland") {
    return combined.includes("germany") || combined.includes("berlin") || combined.includes("munich") || combined.includes("bavaria")
  }

  if (q === "japan" || q === "jp") {
    return combined.includes("japan") || combined.includes("tokyo") || combined.includes("osaka")
  }

  if (q === "australia" || q === "au") {
    return combined.includes("australia") || combined.includes("sydney") || combined.includes("melbourne") || combined.includes("nsw") || combined.includes("vic")
  }

  if (q === "canada" || q === "ca") {
    return combined.includes("canada") || combined.includes("toronto") || combined.includes("vancouver") || combined.includes("ontario")
  }

  if (q === "uae" || q === "dubai" || q === "united arab emirates") {
    return combined.includes("uae") || combined.includes("dubai") || combined.includes("abu dhabi") || combined.includes("emirates")
  }

  // State Aliases
  // India States
  if (q.includes("karnataka") || q === "ka") {
    return combined.includes("karnataka") || combined.includes("bengaluru") || combined.includes("bangalore") || combined.includes("blr")
  }
  if (q.includes("maharashtra") || q === "mh") {
    return combined.includes("maharashtra") || combined.includes("mumbai") || combined.includes("pune")
  }
  if (q.includes("delhi") || q === "dl" || q.includes("ncr") || q.includes("gurugram") || q.includes("noida")) {
    return combined.includes("delhi") || combined.includes("gurugram") || combined.includes("noida") || combined.includes("ncr")
  }
  if (q.includes("telangana") || q === "ts") {
    return combined.includes("telangana") || combined.includes("hyderabad")
  }
  if (q.includes("tamil nadu") || q === "tn") {
    return combined.includes("tamil nadu") || combined.includes("chennai")
  }

  // US States
  if (q.includes("california") || q === "ca" || q.includes("bay area")) {
    return combined.includes("california") || combined.includes("san francisco") || combined.includes("sf") || combined.includes("ca") || combined.includes("los angeles")
  }
  if (q.includes("new york") || q === "ny" || q === "nyc") {
    return combined.includes("new york") || combined.includes("ny") || combined.includes("nyc")
  }
  if (q.includes("texas") || q === "tx") {
    return combined.includes("texas") || combined.includes("austin") || combined.includes("dallas") || combined.includes("houston") || combined.includes("tx")
  }
  if (q.includes("washington") || q === "wa") {
    return combined.includes("washington") || combined.includes("seattle") || combined.includes("wa")
  }
  if (q.includes("massachusetts") || q === "ma") {
    return combined.includes("massachusetts") || combined.includes("boston") || combined.includes("ma")
  }
  if (q.includes("illinois") || q === "il") {
    return combined.includes("illinois") || combined.includes("chicago") || combined.includes("il")
  }

  // City Synonyms
  if (q.includes("bengaluru") || q.includes("bangalore") || q === "blr") {
    return combined.includes("bengaluru") || combined.includes("bangalore") || combined.includes("blr")
  }
  if (q.includes("san francisco") || q === "sf") {
    return combined.includes("san francisco") || combined.includes("sf") || combined.includes("ca")
  }

  return false
}

/**
 * Find center coordinates and zoom level for any location query
 */
export function getMapCoordinatesForQuery(query: string): { lat: number; lng: number; zoom: number } | null {
  if (!query || !query.trim()) return null
  const q = query.toLowerCase().trim()

  // 1. Check exact hub match
  const hub = ALL_LOCATION_HUBS.find((h) =>
    h.query.toLowerCase() === q ||
    h.name.toLowerCase().includes(q) ||
    h.city.toLowerCase() === q
  )
  if (hub && hub.query !== "") {
    return { lat: hub.lat, lng: hub.lng, zoom: hub.zoom }
  }

  // 2. Check Country match
  const country = COUNTRIES_CATALOG.find((c) =>
    c.name.toLowerCase() === q ||
    c.code.toLowerCase() === q ||
    (q === "usa" && c.code === "US") ||
    (q === "uk" && c.code === "UK") ||
    (q === "uae" && c.code === "AE")
  )
  if (country) {
    return { lat: country.lat, lng: country.lng, zoom: country.zoom }
  }

  // 3. Check State match
  for (const c of COUNTRIES_CATALOG) {
    const state = c.states.find((s) =>
      s.name.toLowerCase() === q ||
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase() === q
    )
    if (state) {
      return { lat: state.lat, lng: state.lng, zoom: state.zoom }
    }
  }

  // 4. City aliases
  if (q.includes("bengaluru") || q.includes("bangalore") || q === "blr") {
    return { lat: 12.9716, lng: 77.5946, zoom: 12 }
  }
  if (q.includes("san francisco") || q === "sf") {
    return { lat: 37.7749, lng: -122.4194, zoom: 12 }
  }
  if (q.includes("mumbai") || q.includes("bombay")) {
    return { lat: 19.076, lng: 72.8777, zoom: 12 }
  }
  if (q.includes("delhi") || q.includes("gurugram") || q.includes("noida")) {
    return { lat: 28.6139, lng: 77.209, zoom: 12 }
  }
  if (q.includes("hyderabad")) {
    return { lat: 17.385, lng: 78.4867, zoom: 12 }
  }
  if (q.includes("chennai") || q.includes("madras")) {
    return { lat: 13.0827, lng: 80.2707, zoom: 12 }
  }
  if (q.includes("austin")) {
    return { lat: 30.2672, lng: -97.7431, zoom: 12 }
  }
  if (q.includes("seattle")) {
    return { lat: 47.6062, lng: -122.3321, zoom: 12 }
  }
  if (q.includes("boston")) {
    return { lat: 42.3601, lng: -71.0589, zoom: 12 }
  }
  if (q.includes("london")) {
    return { lat: 51.5074, lng: -0.1278, zoom: 12 }
  }
  if (q.includes("berlin")) {
    return { lat: 52.52, lng: 13.405, zoom: 12 }
  }
  if (q.includes("tokyo")) {
    return { lat: 35.6762, lng: 139.6503, zoom: 12 }
  }
  if (q.includes("singapore")) {
    return { lat: 1.3521, lng: 103.8198, zoom: 12 }
  }
  if (q.includes("sydney")) {
    return { lat: -33.8688, lng: 151.2093, zoom: 12 }
  }
  if (q.includes("toronto")) {
    return { lat: 43.6532, lng: -79.3832, zoom: 12 }
  }
  if (q.includes("dubai")) {
    return { lat: 25.2048, lng: 55.2708, zoom: 12 }
  }

  return null
}
