import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Language = "en" | "hi" | "gu"

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    findJobs: "Find Jobs",
    companies: "Companies",
    atsChecker: "ATS Checker",
    resumeBuilder: "Resume Builder",
    salaryInsights: "Salary Insights",
    skillTests: "Skill Tests",
    pricing: "Pricing",
    messages: "Messages",
    talentSearch: "Talent Search",
    signIn: "Log In",
    postJob: "Post a Job",
    dashboard: "Dashboard",
    logout: "Log Out",
    searchPlaceholder: "Job title, keywords, or company...",
    locationPlaceholder: "City, state, or remote...",
  },
  hi: {
    findJobs: "नौकरियां खोजें",
    companies: "कंपनियां",
    atsChecker: "एटीएस चेकर",
    resumeBuilder: "रिज्यूमे बिल्डर",
    salaryInsights: "वेतन अंतर्दृष्टि",
    skillTests: "कौशल परीक्षण",
    pricing: "मूल्य निर्धारण",
    messages: "संदेश",
    talentSearch: "प्रतिभा खोज",
    signIn: "लॉग इन करें",
    postJob: "नौकरी पोस्ट करें",
    dashboard: "डैशबोर्ड",
    logout: "लॉग आउट",
    searchPlaceholder: "नौकरी का शीर्षक, कीवर्ड या कंपनी...",
    locationPlaceholder: "शहर, राज्य या रिमोट...",
  },
  gu: {
    findJobs: "નોકરીઓ શોધો",
    companies: "કંપનીઓ",
    atsChecker: "એટીએસ ચેકર",
    resumeBuilder: "રિઝ્યુમે બિલ્ડર",
    salaryInsights: "પગાર માહિતી",
    skillTests: "કૌશલ્ય પરીક્ષણ",
    pricing: "યોજનાઓ",
    messages: "સંદેશાઓ",
    talentSearch: "ટેલેન્ટ શોધ",
    signIn: "લૉગ ઇન કરો",
    postJob: "નોકરી પોસ્ટ કરો",
    dashboard: "ડેશબોર્ડ",
    logout: "લોગ આઉટ",
    searchPlaceholder: "નોકરી શીર્ષક, કીવર્ડ અથવા કંપની...",
    locationPlaceholder: "શહેર, રાજ્ય અથવા રિમોટ...",
  },
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
      t: (key: string) => {
        const lang = get().language
        return translations[lang]?.[key] || translations.en[key] || key
      },
    }),
    {
      name: "hirehub-language",
    }
  )
)
