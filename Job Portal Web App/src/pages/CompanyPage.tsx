import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Building,
  MapPin,
  Globe,
  Users,
  ArrowLeft,
  Star,
  ExternalLink,
  BadgeCheck,
  Map as MapIcon,
  Compass,
  Calendar,
  ShieldCheck,
  Sparkles,
  Award,
} from "lucide-react"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import { companyService } from "../lib/supabase"
import { mockCompanies } from "../data/mockData"
import { getCompanyRealLogo } from "../data/companyLogos"
import type { Company } from "../types"
import toast from "react-hot-toast"

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [company, setCompany] = useState<Company | null>(null)
  const [totalCompaniesCount, setTotalCompaniesCount] = useState<number>(mockCompanies.length)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showMap, setShowMap] = useState(true)

  useEffect(() => {
    async function loadCompany() {
      if (!id) return
      setIsLoading(true)
      try {
        const allComps = await companyService.getCompanies()
        if (allComps && allComps.length > 0) {
          setTotalCompaniesCount(allComps.length)
        }
        const found = await companyService.getCompanyBySlug(id)
        if (found) {
          setCompany({
            ...found,
            logo: getCompanyRealLogo(found.name, found.website, found.logo),
          })
        } else {
          // Fallback to mock search
          const fallback = mockCompanies.find(
            (c) =>
              c.id === id ||
              c.slug === id ||
              c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === id.toLowerCase() ||
              c.name.toLowerCase() === id.toLowerCase()
          )
          if (fallback) {
            setCompany({
              ...fallback,
              logo: getCompanyRealLogo(fallback.name, fallback.website, fallback.logo),
            })
          }
        }
      } catch (err) {
        console.error("Error loading company:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadCompany()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] pt-32 pb-16 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-[var(--background)] pt-28 pb-16 px-4">
        <div className="max-w-md mx-auto bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] text-center shadow-lg">
          <Building size={44} className="mx-auto text-[var(--muted-foreground)] mb-3 opacity-50" />
          <h2 className="text-xl font-bold text-[var(--foreground)]">Company Not Found</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            No verified company profile exists with the identifier "{id}".
          </p>
          <Button variant="primary" className="mt-5 w-full" onClick={() => navigate("/companies")}>
            Browse Verified Companies
          </Button>
        </div>
      </div>
    )
  }

  const handleFollowToggle = () => {
    setIsFollowing((prev) => {
      const next = !prev
      if (next) {
        toast.success(`You are now following ${company.name}`)
      } else {
        toast("Unfollowed " + company.name)
      }
      return next
    })
  }

  const mapQuery = encodeURIComponent(
    company.address || `${company.name}, ${company.location || "San Francisco, CA"}`
  )

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {/* Banner */}
      <div className="h-64 sm:h-80 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-deep)] relative overflow-hidden">
        {company.banner ? (
          <img
            src={company.banner}
            alt={`${company.name} Banner`}
            className="w-full h-full object-cover opacity-85"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[var(--accent)] to-[#1E0B29] opacity-90" />
        )}
        <div className="absolute top-24 left-4 sm:left-8 z-10 flex items-center gap-3">
          <Button
            variant="outline"
            className="bg-black/40 backdrop-blur-md border-white/20 text-white hover:bg-black/60 shadow-lg text-xs sm:text-sm font-semibold"
            onClick={() => navigate("/companies")}
          >
            <ArrowLeft size={16} className="mr-2" /> All Companies ({totalCompaniesCount} Available)
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-24">
        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 sm:p-10 shadow-[var(--shadow-card)]">
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end justify-between">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white dark:bg-slate-900 border-4 border-[var(--card)] flex items-center justify-center shrink-0 shadow-lg overflow-hidden ring-1 ring-[var(--border)] p-2">
                <img
                  src={getCompanyRealLogo(company.name, company.website, company.logo)}
                  alt={company.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = getCompanyRealLogo(company.name, company.website)
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                    {company.name}
                  </h1>
                  {company.isVerified ? (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      title="Admin Verified Company"
                    >
                      <BadgeCheck size={14} className="text-blue-500" /> Verified Employer
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      Pending Verification
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                    <Building size={12} /> 1 of {totalCompaniesCount} Companies Available
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <Badge variant="default" size="sm">
                    {company.industry || "Technology"}
                  </Badge>
                  {company.rating && (
                    <div className="flex items-center gap-1 text-sm font-semibold text-[var(--foreground)]">
                      <Star size={14} className="fill-[var(--accent)] text-[var(--accent)]" />
                      <span>{company.rating}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        ({company.reviewCount || 120} reviews)
                      </span>
                    </div>
                  )}
                  {company.size && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {company.size} employees
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" size="lg" className="w-full font-semibold">
                    Visit Website <ExternalLink size={14} className="ml-1.5" />
                  </Button>
                </a>
              )}
              <Button
                variant={isFollowing ? "outline" : "primary"}
                size="lg"
                onClick={handleFollowToggle}
                className="w-full sm:w-auto font-semibold shrink-0"
              >
                {isFollowing ? "✓ Following" : "+ Follow"}
              </Button>
            </div>
          </div>

          {/* Quick Meta Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-8 py-5 border-y border-[var(--border)] text-sm">
            <div className="flex items-center gap-2.5 text-[var(--foreground)] font-medium">
              <MapPin size={18} className="text-[var(--primary)] shrink-0" />
              <div>
                <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">
                  Headquarters
                </p>
                <p className="text-xs sm:text-sm font-bold truncate">
                  {company.location || "Global Remote"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-[var(--foreground)] font-medium">
              <Users size={18} className="text-[var(--primary)] shrink-0" />
              <div>
                <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">
                  Company Size
                </p>
                <p className="text-xs sm:text-sm font-bold">
                  {company.size || "50-200"} team
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-[var(--foreground)] font-medium">
              <Calendar size={18} className="text-[var(--primary)] shrink-0" />
              <div>
                <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">
                  Founded
                </p>
                <p className="text-xs sm:text-sm font-bold">
                  {company.founded || "Established"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-[var(--foreground)] font-medium">
              <ShieldCheck size={18} className="text-[var(--primary)] shrink-0" />
              <div>
                <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">
                  Entity Status
                </p>
                <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Verified Org
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-[var(--foreground)] font-medium">
              <Building size={18} className="text-[var(--primary)] shrink-0" />
              <div>
                <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">
                  Total Available
                </p>
                <p className="text-xs sm:text-sm font-bold text-[var(--primary)]">
                  {totalCompaniesCount} Companies
                </p>
              </div>
            </div>
            </div>
          </div>

          {/* About Section */}
          <div className="mt-8">
            <h2 className="font-poppins text-xl font-bold text-[var(--foreground)] mb-3">
              About {company.name}
            </h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
              {company.about ||
                company.description ||
                `${company.name} is a high-growth technology leader building scalable products and fostering world-class engineering, design, and collaborative talent.`}
            </p>
          </div>

          {/* Corporate Highlights & Culture */}
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)]">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-2.5 font-bold">
                <Globe size={16} />
              </div>
              <h4 className="font-bold text-sm text-[var(--foreground)] mb-1">
                Global Operations
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Distributed teams operating across international time zones with modern remote infrastructure.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)]">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2.5 font-bold">
                <Sparkles size={16} />
              </div>
              <h4 className="font-bold text-sm text-[var(--foreground)] mb-1">
                Innovative Culture
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Prioritizing autonomy, developer velocity, collaborative design, and continuous learning.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)]">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2.5 font-bold">
                <Award size={16} />
              </div>
              <h4 className="font-bold text-sm text-[var(--foreground)] mb-1">
                Verified Reputation
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Top employer rating based on authentic team reviews and competitive benefits.
              </p>
            </div>
          </div>

          {/* GIS Location Map View */}
          <div className="mt-8 pt-8 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-poppins text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                  <MapIcon size={18} className="text-[var(--primary)]" />
                  Office Location & Workplace Map
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {company.address || company.location || "Worldwide Remote / Hybrid Headquarters"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <Compass size={13} /> {showMap ? "Hide Map" : "Show Map"}
              </button>
            </div>

            {showMap && (
              <div className="rounded-2xl overflow-hidden border border-[var(--border)] h-64 sm:h-80 w-full bg-[var(--muted)]/40 relative shadow-inner">
                <iframe
                  title={`${company.name} Map Location`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full grayscale-[20%] contrast-[1.05]"
                />
              </div>
            )}
          </div>

          {/* Total Companies Available on HireHub */}
          <div className="mt-8 pt-8 border-t border-[var(--border)]">
            <div className="p-6 rounded-2xl bg-[var(--muted)]/40 border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <Building size={16} className="text-[var(--primary)]" />
                  <h4 className="font-poppins font-bold text-base text-[var(--foreground)]">
                    Total Companies Available: {totalCompaniesCount}
                  </h4>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] max-w-xl">
                  HireHub features {totalCompaniesCount} verified employer organizations, engineering laboratories, and technology innovators worldwide.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate("/companies")}
                className="shrink-0 text-xs font-semibold px-5 py-2.5 shadow-sm"
              >
                Browse All {totalCompaniesCount} Companies
              </Button>
            </div>
          </div>
        </div>
      </div>
  )
}
