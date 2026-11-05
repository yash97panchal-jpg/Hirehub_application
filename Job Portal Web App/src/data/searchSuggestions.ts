import { Job } from "../types"
import { COUNTRIES_CATALOG, ALL_LOCATION_HUBS } from "./locationCatalog"

// -----------------------------------------------------------------------------
// 1. ROLES & SKILLS CATALOG
// -----------------------------------------------------------------------------
export interface RoleSuggestion {
  type?: "role"
  title: string
  field: string
}

export interface SkillSuggestion {
  type?: "skill"
  name: string
  relatedRole?: string
}

export interface CategorySuggestion {
  type?: "category"
  name: string
  count?: number
}

export const POPULAR_ROLES: RoleSuggestion[] = [
  // Python & Data / AI Roles
  { title: "Python Developer", field: "Software Engineering" },
  { title: "Senior Python Engineer", field: "Backend Engineering" },
  { title: "Python Backend Developer", field: "Backend Engineering" },
  { title: "Python AI & ML Engineer", field: "Artificial Intelligence" },
  { title: "Python Data Scientist", field: "Data Science" },
  { title: "Python Automation Engineer", field: "QA & Testing" },
  { title: "Django / FastAPI Developer", field: "Web Development" },

  // Frontend & Mobile Roles
  { title: "Frontend Developer", field: "Frontend Engineering" },
  { title: "Senior React Developer", field: "Frontend Engineering" },
  { title: "Full Stack Developer", field: "Full Stack" },
  { title: "Next.js Engineer", field: "Frontend Engineering" },
  { title: "Mobile App Developer (iOS / Android)", field: "Mobile Engineering" },
  { title: "React Native Developer", field: "Mobile Engineering" },
  { title: "iOS Swift Developer", field: "Mobile Engineering" },
  { title: "Android Kotlin Developer", field: "Mobile Engineering" },

  // Backend & Cloud Roles
  { title: "Backend Engineer", field: "Backend Engineering" },
  { title: "Node.js Developer", field: "Backend Engineering" },
  { title: "Go / Golang Engineer", field: "Distributed Systems" },
  { title: "Java Software Engineer", field: "Enterprise Backend" },
  { title: "DevOps Engineer", field: "Cloud & Infrastructure" },
  { title: "Cloud Solutions Architect", field: "Cloud Architecture" },
  { title: "Site Reliability Engineer (SRE)", field: "Infrastructure" },
  { title: "Kubernetes & Platform Engineer", field: "Cloud Infrastructure" },

  // AI, Data & Security Roles
  { title: "Machine Learning Engineer", field: "AI & ML" },
  { title: "Data Scientist", field: "Data Science" },
  { title: "Data Engineer", field: "Data Engineering" },
  { title: "Computer Vision Engineer", field: "AI Research" },
  { title: "NLP & LLM Engineer", field: "Generative AI" },
  { title: "Cybersecurity Analyst", field: "Security & Compliance" },

  // Design & Product Roles
  { title: "UI/UX Designer", field: "Product Design" },
  { title: "Product Designer", field: "Product Design" },
  { title: "Design Systems Engineer", field: "Design & UX" },
  { title: "Product Manager", field: "Product Management" },
  { title: "Technical Project Manager", field: "Project Management" },
]

export const POPULAR_SKILLS: SkillSuggestion[] = [
  // Python & AI Ecosystem
  { name: "Python", relatedRole: "Python Developer" },
  { name: "PyTorch", relatedRole: "AI / ML Engineer" },
  { name: "TensorFlow", relatedRole: "Machine Learning" },
  { name: "FastAPI", relatedRole: "Backend Python" },
  { name: "Django", relatedRole: "Full Stack Python" },
  { name: "Pandas & NumPy", relatedRole: "Data Science" },
  { name: "LLMs & LangChain", relatedRole: "AI Systems Engineer" },
  { name: "Scikit-Learn", relatedRole: "Machine Learning" },

  // Web & Frontend
  { name: "React", relatedRole: "Frontend Developer" },
  { name: "TypeScript", relatedRole: "Full Stack Engineer" },
  { name: "JavaScript", relatedRole: "Web Developer" },
  { name: "Next.js", relatedRole: "React Developer" },
  { name: "Tailwind CSS", relatedRole: "Frontend UI" },
  { name: "HTML & CSS", relatedRole: "Web Developer" },
  { name: "GraphQL", relatedRole: "API Engineering" },
  { name: "Vue.js", relatedRole: "Frontend Developer" },

  // Backend & Cloud
  { name: "Node.js", relatedRole: "Backend Developer" },
  { name: "Go / Golang", relatedRole: "Cloud Engineer" },
  { name: "Java", relatedRole: "Enterprise Systems" },
  { name: "C++", relatedRole: "Systems Engineering" },
  { name: "Rust", relatedRole: "High Performance Systems" },
  { name: "PostgreSQL", relatedRole: "Database & Backend" },
  { name: "Redis", relatedRole: "Caching & Queues" },
  { name: "Kafka", relatedRole: "Event Streaming" },
  { name: "AWS", relatedRole: "Cloud Architect" },
  { name: "Docker", relatedRole: "DevOps Engineer" },
  { name: "Kubernetes", relatedRole: "DevOps Engineer" },
  { name: "Terraform", relatedRole: "Infrastructure as Code" },
  { name: "SQL", relatedRole: "Data Analytics" },

  // Design & Mobile
  { name: "Figma", relatedRole: "UI/UX Designer" },
  { name: "Swift", relatedRole: "iOS Developer" },
  { name: "Kotlin", relatedRole: "Android Developer" },
  { name: "Flutter", relatedRole: "Cross-Platform Mobile" },
]

export interface RoleSkillResult {
  roles: RoleSuggestion[]
  skills: SkillSuggestion[]
  categories: string[]
}

/**
 * Filter roles, skills, and categories matching user query
 */
export function getRoleAndSkillSuggestions(
  query: string,
  dynamicJobs: Job[] = [],
): RoleSkillResult {
  const clean = query.trim().toLowerCase()
  if (!clean) {
    return {
      roles: POPULAR_ROLES.slice(0, 5),
      skills: POPULAR_SKILLS.slice(0, 6),
      categories: ["Engineering", "Data & AI", "Design", "Product"],
    }
  }

  // 1. Match Roles (static list + dynamic job titles)
  const matchedRoleTitles = new Set<string>()
  const roles: RoleSuggestion[] = []

  // Check static list
  for (const r of POPULAR_ROLES) {
    if (r.title.toLowerCase().includes(clean) || r.field.toLowerCase().includes(clean)) {
      matchedRoleTitles.add(r.title.toLowerCase())
      roles.push(r)
      if (roles.length >= 5) break
    }
  }

  // Check dynamic jobs for unique titles
  if (roles.length < 5) {
    for (const j of dynamicJobs) {
      const lowerTitle = j.title.toLowerCase()
      if (lowerTitle.includes(clean) && !matchedRoleTitles.has(lowerTitle)) {
        matchedRoleTitles.add(lowerTitle)
        roles.push({ title: j.title, field: j.category || "Job Title" })
        if (roles.length >= 5) break
      }
    }
  }

  // 2. Match Skills (static + dynamic job skills)
  const matchedSkillNames = new Set<string>()
  const skills: SkillSuggestion[] = []

  for (const s of POPULAR_SKILLS) {
    if (s.name.toLowerCase().includes(clean) || (s.relatedRole && s.relatedRole.toLowerCase().includes(clean))) {
      matchedSkillNames.add(s.name.toLowerCase())
      skills.push(s)
      if (skills.length >= 6) break
    }
  }

  if (skills.length < 6) {
    for (const j of dynamicJobs) {
      if (j.skills && Array.isArray(j.skills)) {
        for (const sk of j.skills) {
          const lowerSk = sk.toLowerCase()
          if (lowerSk.includes(clean) && !matchedSkillNames.has(lowerSk)) {
            matchedSkillNames.add(lowerSk)
            skills.push({ name: sk, relatedRole: j.title })
            if (skills.length >= 6) break
          }
        }
      }
      if (skills.length >= 6) break
    }
  }

  // 3. Match Categories
  const categoriesList = [
    "Engineering",
    "Data & AI",
    "Product Management",
    "Design",
    "Cloud & Infrastructure",
    "Cybersecurity",
    "Finance",
    "Sales & Marketing",
  ]
  const categories = categoriesList.filter((cat) => cat.toLowerCase().includes(clean)).slice(0, 3)

  return { roles, skills, categories }
}

// -----------------------------------------------------------------------------
// 2. THREE-TIER LOCATION SUGGESTIONS CATALOG
// (Tier 1: Country, Tier 2: Country with State, Tier 3: Country with State with City)
// -----------------------------------------------------------------------------
export interface LocationSuggestionItem {
  tier: "country" | "state_country" | "city_state_country"
  label: string
  country: string
  state?: string
  city?: string
  value: string
  subtext?: string
}

export interface LocationHierarchyResult {
  countries: LocationSuggestionItem[]
  states: LocationSuggestionItem[]
  cities: LocationSuggestionItem[]
}

// Comprehensive city database mapped to states & countries
export interface CityRecord {
  city: string
  state: string
  country: string
  alias?: string[]
}

export const GLOBAL_CITIES: CityRecord[] = [
  // India
  { city: "Bengaluru", state: "Karnataka", country: "India", alias: ["bangalore", "blr"] },
  { city: "Mumbai", state: "Maharashtra", country: "India", alias: ["bombay"] },
  { city: "Pune", state: "Maharashtra", country: "India" },
  { city: "Delhi", state: "Delhi NCR", country: "India", alias: ["new delhi", "gurugram", "noida"] },
  { city: "Hyderabad", state: "Telangana", country: "India", alias: ["cyberabad"] },
  { city: "Chennai", state: "Tamil Nadu", country: "India", alias: ["madras"] },
  { city: "Ahmedabad", state: "Gujarat", country: "India" },
  { city: "Kolkata", state: "West Bengal", country: "India", alias: ["calcutta"] },
  { city: "Kochi", state: "Kerala", country: "India", alias: ["cochin"] },
  { city: "Jaipur", state: "Rajasthan", country: "India" },

  // United States
  { city: "San Francisco", state: "California", country: "United States", alias: ["sf", "bay area", "silicon valley"] },
  { city: "Los Angeles", state: "California", country: "United States", alias: ["la"] },
  { city: "San Jose", state: "California", country: "United States" },
  { city: "New York", state: "New York", country: "United States", alias: ["nyc", "manhattan"] },
  { city: "Austin", state: "Texas", country: "United States" },
  { city: "Dallas", state: "Texas", country: "United States" },
  { city: "Houston", state: "Texas", country: "United States" },
  { city: "Seattle", state: "Washington", country: "United States" },
  { city: "Boston", state: "Massachusetts", country: "United States" },
  { city: "Chicago", state: "Illinois", country: "United States" },
  { city: "Atlanta", state: "Georgia", country: "United States" },
  { city: "Miami", state: "Florida", country: "United States" },
  { city: "Denver", state: "Colorado", country: "United States" },

  // United Kingdom
  { city: "London", state: "Greater London", country: "United Kingdom", alias: ["ldn"] },
  { city: "Manchester", state: "Greater Manchester", country: "United Kingdom" },
  { city: "Edinburgh", state: "Scotland", country: "United Kingdom" },
  { city: "Cambridge", state: "Cambridgeshire", country: "United Kingdom" },

  // Germany
  { city: "Berlin", state: "Berlin", country: "Germany" },
  { city: "Munich", state: "Bavaria", country: "Germany", alias: ["münchen"] },
  { city: "Frankfurt", state: "Hesse", country: "Germany" },
  { city: "Hamburg", state: "Hamburg", country: "Germany" },

  // Japan
  { city: "Tokyo", state: "Tokyo", country: "Japan" },
  { city: "Osaka", state: "Osaka", country: "Japan" },
  { city: "Kyoto", state: "Kyoto", country: "Japan" },

  // Singapore
  { city: "Singapore", state: "Central Region", country: "Singapore" },

  // Australia
  { city: "Sydney", state: "New South Wales", country: "Australia", alias: ["nsw"] },
  { city: "Melbourne", state: "Victoria", country: "Australia", alias: ["vic"] },
  { city: "Brisbane", state: "Queensland", country: "Australia" },

  // Canada
  { city: "Toronto", state: "Ontario", country: "Canada" },
  { city: "Vancouver", state: "British Columbia", country: "Canada", alias: ["bc"] },
  { city: "Montreal", state: "Quebec", country: "Canada" },
  { city: "Ottawa", state: "Ontario", country: "Canada" },

  // Switzerland
  { city: "Zurich", state: "Zurich", country: "Switzerland" },
  { city: "Geneva", state: "Geneva", country: "Switzerland" },

  // UAE
  { city: "Dubai", state: "Dubai", country: "United Arab Emirates", alias: ["dxb"] },
  { city: "Abu Dhabi", state: "Abu Dhabi", country: "United Arab Emirates" },
]

/**
 * Filter 3-tier location suggestions (Country, Country with State, Country with State with City)
 * Evaluates any typed word (even 1 letter or word)
 */
export function getLocationHierarchySuggestions(query: string): LocationHierarchyResult {
  const clean = query.trim().toLowerCase()

  const countriesMap = new Map<string, LocationSuggestionItem>()
  const statesMap = new Map<string, LocationSuggestionItem>()
  const citiesMap = new Map<string, LocationSuggestionItem>()

  // If query is empty, provide popular international hubs
  if (!clean) {
    // Top countries
    for (const c of COUNTRIES_CATALOG.slice(0, 4)) {
      countriesMap.set(c.name, {
        tier: "country",
        label: c.name,
        country: c.name,
        value: c.name,
        subtext: "Country",
      })
    }
    // Top states
    statesMap.set("Karnataka, India", {
      tier: "state_country",
      label: "Karnataka, India",
      country: "India",
      state: "Karnataka",
      value: "Karnataka, India",
      subtext: "State & Country",
    })
    statesMap.set("California, United States", {
      tier: "state_country",
      label: "California, United States",
      country: "United States",
      state: "California",
      value: "California, United States",
      subtext: "State & Country",
    })
    // Top cities
    citiesMap.set("Bengaluru, Karnataka, India", {
      tier: "city_state_country",
      label: "Bengaluru, Karnataka, India",
      country: "India",
      state: "Karnataka",
      city: "Bengaluru",
      value: "Bengaluru, Karnataka, India",
      subtext: "City, State & Country",
    })
    citiesMap.set("San Francisco, California, United States", {
      tier: "city_state_country",
      label: "San Francisco, California, United States",
      country: "United States",
      state: "California",
      city: "San Francisco",
      value: "San Francisco, California, United States",
      subtext: "City, State & Country",
    })

    return {
      countries: Array.from(countriesMap.values()),
      states: Array.from(statesMap.values()),
      cities: Array.from(citiesMap.values()),
    }
  }

  // 1. TIER 1: Match Countries
  for (const c of COUNTRIES_CATALOG) {
    const countryLower = c.name.toLowerCase()
    const codeLower = c.code.toLowerCase()
    if (countryLower.includes(clean) || codeLower === clean) {
      countriesMap.set(c.name, {
        tier: "country",
        label: c.name,
        country: c.name,
        value: c.name,
        subtext: "Country",
      })
    }
  }

  // 2. TIER 2: Match States with Country
  for (const c of COUNTRIES_CATALOG) {
    const countryLower = c.name.toLowerCase()
    for (const s of c.states) {
      const stateLower = s.name.toLowerCase()
      const codeLower = s.code.toLowerCase()
      const fullLabel = `${s.name}, ${c.name}`

      // Match state name, state code, or parent country
      if (stateLower.includes(clean) || codeLower === clean || countryLower.includes(clean)) {
        statesMap.set(fullLabel, {
          tier: "state_country",
          label: fullLabel,
          country: c.name,
          state: s.name,
          value: fullLabel,
          subtext: "State & Country",
        })
      }
    }
  }

  // 3. TIER 3: Match Cities with State and Country
  for (const item of GLOBAL_CITIES) {
    const cityLower = item.city.toLowerCase()
    const stateLower = item.state.toLowerCase()
    const countryLower = item.country.toLowerCase()
    const fullLabel = `${item.city}, ${item.state}, ${item.country}`

    const matchesCity = cityLower.includes(clean)
    const matchesState = stateLower.includes(clean)
    const matchesCountry = countryLower.includes(clean)
    const matchesAlias = item.alias?.some((a) => a.toLowerCase().includes(clean))

    if (matchesCity || matchesState || matchesCountry || matchesAlias) {
      citiesMap.set(fullLabel, {
        tier: "city_state_country",
        label: fullLabel,
        country: item.country,
        state: item.state,
        city: item.city,
        value: fullLabel,
        subtext: "City, State & Country",
      })

      // Also ensure parent country and state are represented in Tier 1 & 2
      if (!countriesMap.has(item.country) && countriesMap.size < 4) {
        countriesMap.set(item.country, {
          tier: "country",
          label: item.country,
          country: item.country,
          value: item.country,
          subtext: "Country",
        })
      }

      const stateCountryKey = `${item.state}, ${item.country}`
      if (!statesMap.has(stateCountryKey) && statesMap.size < 5) {
        statesMap.set(stateCountryKey, {
          tier: "state_country",
          label: stateCountryKey,
          country: item.country,
          state: item.state,
          value: stateCountryKey,
          subtext: "State & Country",
        })
      }
    }
  }

  return {
    countries: Array.from(countriesMap.values()).slice(0, 4),
    states: Array.from(statesMap.values()).slice(0, 5),
    cities: Array.from(citiesMap.values()).slice(0, 6),
  }
}
