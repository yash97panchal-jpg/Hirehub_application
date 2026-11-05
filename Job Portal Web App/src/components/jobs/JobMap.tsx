import { useState, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  MapPin,
  Navigation,
  Copy,
  Check,
  Building2,
  Compass,
  Globe,
  Satellite,
  Moon,
  Map as MapIcon,
  Layers,
} from "lucide-react"
import type { Job } from "../../types"
import { getCompanyRealLogo } from "../../data/companyLogos"
import {
  ALL_LOCATION_HUBS,
  COUNTRIES_CATALOG,
  getMapCoordinatesForQuery,
  type LocationHub,
} from "../../data/locationCatalog"

export type MapStyle = "real-world" | "satellite" | "dark" | "streets" | "vector"

interface JobMapProps {
  jobs: Job[]
  selectedJob?: Job | null
  onSelectJob?: (job: Job | null) => void
  activeLocation?: string
  onLocationChange?: (location: string) => void
  roleKeyword?: string
  className?: string
  mapHeightClass?: string
  showToolbar?: boolean
}

export interface CompanyMarkerGroup {
  companyId: string
  companyName: string
  logo: string
  banner?: string
  address: string
  city: string
  coordinates: { lat: number; lng: number }
  x: number
  y: number
  jobs: Job[]
  industry?: string
  rating?: number
  reviewCount?: number
  founded?: number
}

// Worldwide coordinate projection helper: maps (lat, lng) to (x, y) on 1200x620 SVG canvas for Vector theme
const MIN_LNG = -180
const MAX_LNG = 180
const LNG_SPAN = 360

const MIN_LAT = -60
const MAX_LAT = 80
const LAT_SPAN = 140

function projectCoordinates(lat: number, lng: number): { x: number; y: number } {
  const clampedLng = Math.max(MIN_LNG, Math.min(MAX_LNG, lng))
  const clampedLat = Math.max(MIN_LAT, Math.min(MAX_LAT, lat))

  const x = ((clampedLng - MIN_LNG) / LNG_SPAN) * 1200
  const y = ((MAX_LAT - clampedLat) / LAT_SPAN) * 620

  return { x: Math.round(x), y: Math.round(y) }
}

const WORLD_TECH_HUBS = ALL_LOCATION_HUBS

const REAL_MAP_TILES: Record<
  string,
  { url: string; attribution: string; maxZoom: number; subdomains?: string[] }
> = {
  "real-world": {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Map &copy; <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a>, DeLorme, NAVTEQ',
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Satellite &copy; <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a>, Earthstar Geographics',
    maxZoom: 18,
  },
  dark: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Dark Canvas &copy; <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a>, DeLorme, NAVTEQ',
    maxZoom: 16,
  },
  streets: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Topographic &copy; <a href="https://www.esri.com/" target="_blank" rel="noreferrer">Esri</a>, USGS, TomTom',
    maxZoom: 19,
  },
}

function createCustomPinIcon(group: CompanyMarkerGroup, isSelected: boolean): L.DivIcon {
  const pinFill = isSelected ? "#EA4335" : "#D93025"
  const shortName =
    group.companyName.length > 15
      ? group.companyName.slice(0, 14) + "…"
      : group.companyName

  const html = `
    <div class="hirehub-marker-container">
      ${isSelected ? '<div class="hirehub-radar-pulse"></div>' : ""}
      <div class="hirehub-marker-pin ${isSelected ? "active" : ""}">
        <svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 44C18 44 34 27.5 34 18C34 9.16344 26.8366 2 18 2C9.16344 2 2 9.16344 2 18C2 27.5 18 44 18 44Z" fill="${pinFill}" stroke="#FFFFFF" stroke-width="${isSelected ? 2.5 : 1.5}"/>
          <circle cx="18" cy="18" r="11" fill="#FFFFFF"/>
        </svg>
        <img src="${group.logo}" alt="${group.companyName}" class="hirehub-marker-logo" onerror="this.src='https://www.google.com/s2/favicons?domain=google.com&sz=128'" />
      </div>
      <div class="hirehub-marker-badge">
        <span>${shortName}</span>
        ${group.jobs.length > 1 ? ` · <span style="font-weight:800;color:#2563eb;">${group.jobs.length} jobs</span>` : ""}
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: "hirehub-leaflet-marker",
    iconSize: [36, 62],
    iconAnchor: [18, 44],
  })
}

export default function JobMap({
  jobs,
  selectedJob,
  onSelectJob,
  activeLocation = "",
  onLocationChange,
  className = "",
  mapHeightClass = "h-[480px] sm:h-[540px]",
  showToolbar = true,
}: JobMapProps) {
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [mapStyle, setMapStyle] = useState<MapStyle>("real-world")
  const [copiedAddress, setCopiedAddress] = useState(false)

  // Leaflet references
  const mapElementRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const activeCompanyIdRef = useRef<string | null>(null)
  activeCompanyIdRef.current = activeCompanyId

  // Vector fallback state
  const [vectorZoomLevel, setVectorZoomLevel] = useState<number>(1)
  const [vectorViewCenter, setVectorViewCenter] = useState<{ x: number; y: number }>({
    x: 600,
    y: 310,
  })
  const [isVectorDragging, setIsVectorDragging] = useState(false)
  const [vectorDragStart, setVectorDragStart] = useState({ x: 0, y: 0 })
  const [hasMovedDuringDrag, setHasMovedDuringDrag] = useState(false)
  const vectorContainerRef = useRef<HTMLDivElement>(null)

  // Group jobs with coordinates by company & physical location
  const markerGroups: CompanyMarkerGroup[] = useMemo(() => {
    const groupsMap = new Map<string, CompanyMarkerGroup>()

    jobs.forEach((job) => {
      const coords = job.coordinates || job.company?.coordinates
      const addr = job.address || job.company?.address || job.location

      if (!coords) return

      const key = `${job.company.id}-${coords.lat.toFixed(2)}-${coords.lng.toFixed(2)}`
      const existing = groupsMap.get(key)

      if (existing) {
        existing.jobs.push(job)
      } else {
        const { x, y } = projectCoordinates(coords.lat, coords.lng)
        groupsMap.set(key, {
          companyId: job.company.id,
          companyName: job.company.name,
          logo: getCompanyRealLogo(job.company.name, job.company.website, job.company.logo),
          banner: job.company.banner,
          address: addr,
          city: job.location,
          coordinates: coords,
          x,
          y,
          jobs: [job],
          industry: job.company.industry || "Technology Company",
          rating: job.company.rating || 4.7,
          reviewCount: job.company.reviewCount || 140,
          founded: job.company.founded,
        })
      }
    })

    return Array.from(groupsMap.values())
  }, [jobs])

  // Active selected marker group (respects explicit dismissal / close button!)
  const activeGroup = useMemo(() => {
    if (isDismissed) return null
    if (activeCompanyId) {
      return markerGroups.find((g) => g.companyId === activeCompanyId) || null
    }
    if (selectedJob) {
      return (
        markerGroups.find(
          (g) =>
            g.companyId === selectedJob.company?.id ||
            g.jobs.some((j) => j.id === selectedJob.id),
        ) || null
      )
    }
    return null
  }, [isDismissed, activeCompanyId, selectedJob, markerGroups])

  // Handle marker selection cleanly
  const handleMarkerClick = (group: CompanyMarkerGroup) => {
    setIsDismissed(false)
    setActiveCompanyId(group.companyId)

    if (leafletMapRef.current && mapStyle !== "vector") {
      leafletMapRef.current.flyTo(
        [group.coordinates.lat, group.coordinates.lng],
        Math.max(leafletMapRef.current.getZoom(), 13),
        { duration: 1.2 },
      )
    } else {
      setVectorViewCenter({
        x: Math.max(160, group.x - 100),
        y: group.y,
      })
      setVectorZoomLevel((z) => Math.max(z, 1.85))
    }

    if (group.jobs.length > 0 && onSelectJob) {
      onSelectJob(group.jobs[0])
    }
  }

  // Handle closing the place card
  const handleCloseCard = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveCompanyId(null)
    setIsDismissed(true)
    onSelectJob?.(null)
  }

  // --- Initialize Leaflet Map ---
  useEffect(() => {
    if (mapStyle === "vector" || !mapElementRef.current) return

    if (!leafletMapRef.current) {
      const map = L.map(mapElementRef.current, {
        center: [25, 0],
        zoom: 2,
        minZoom: 1.5,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: true,
      })

      // Add Tile Layer
      const tileConfig = REAL_MAP_TILES[mapStyle] || REAL_MAP_TILES["real-world"]
      const tileLayer = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        maxZoom: tileConfig.maxZoom,
        subdomains: tileConfig.subdomains || ["a", "b", "c"],
      }).addTo(map)

      tileLayerRef.current = tileLayer

      // Create LayerGroup for markers
      const markersLayer = L.layerGroup().addTo(map)
      markersLayerRef.current = markersLayer

      // Click on background closes card
      map.on("click", () => {
        setActiveCompanyId(null)
        setIsDismissed(true)
        onSelectJob?.(null)
      })

      leafletMapRef.current = map

      // Invalidate size once container settles
      setTimeout(() => {
        map.invalidateSize()
      }, 250)
    }

    return () => {
      // Don't destroy immediately on simple re-renders, but do cleanup if unmounted
    }
  }, [mapStyle])

  // Cleanup Leaflet on full unmount
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  // Invalidate map size on window resize
  useEffect(() => {
    const handleResize = () => {
      leafletMapRef.current?.invalidateSize()
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // --- Update Tile Layer on Map Style Change ---
  useEffect(() => {
    if (mapStyle === "vector" || !leafletMapRef.current) return

    const tileConfig = REAL_MAP_TILES[mapStyle] || REAL_MAP_TILES["real-world"]

    if (tileLayerRef.current) {
      leafletMapRef.current.removeLayer(tileLayerRef.current)
    }

    const newTileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      subdomains: tileConfig.subdomains || ["a", "b", "c"],
    }).addTo(leafletMapRef.current)

    tileLayerRef.current = newTileLayer
    leafletMapRef.current.invalidateSize()
  }, [mapStyle])

  // --- Render Leaflet Markers on MarkerGroups or ActiveGroup Change ---
  useEffect(() => {
    if (mapStyle === "vector" || !leafletMapRef.current || !markersLayerRef.current) return

    const markersLayer = markersLayerRef.current
    markersLayer.clearLayers()

    markerGroups.forEach((group) => {
      const isSelected = activeCompanyId === group.companyId
      const icon = createCustomPinIcon(group, isSelected)

      const marker = L.marker([group.coordinates.lat, group.coordinates.lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : 100,
      })

      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e)
        handleMarkerClick(group)
      })

      marker.addTo(markersLayer)
    })
  }, [markerGroups, activeCompanyId, mapStyle])

  // --- Sync with selectedJob prop (from Job list or parent) ---
  useEffect(() => {
    if (selectedJob) {
      setIsDismissed(false)
      setActiveCompanyId(selectedJob.company?.id || null)

      const coords = selectedJob.coordinates || selectedJob.company?.coordinates
      if (coords) {
        if (leafletMapRef.current && mapStyle !== "vector") {
          leafletMapRef.current.flyTo([coords.lat, coords.lng], 13, { duration: 1.2 })
        } else {
          const { x, y } = projectCoordinates(coords.lat, coords.lng)
          setVectorViewCenter({ x: Math.max(160, x - 100), y })
          setVectorZoomLevel((z) => Math.max(z, 1.85))
        }
      }
    }
  }, [selectedJob, mapStyle])

  // --- Auto-center & fly to activeLocation or fitBounds of filtered jobs ---
  useEffect(() => {
    if (!leafletMapRef.current || mapStyle === "vector") return
    if (!activeLocation) return

    const loc = activeLocation.toLowerCase().trim()
    const targetCoords = getMapCoordinatesForQuery(loc)

    if (targetCoords) {
      leafletMapRef.current.flyTo([targetCoords.lat, targetCoords.lng], targetCoords.zoom, { duration: 1.2 })
      const matched = markerGroups.find(
        (g) =>
          g.city.toLowerCase().includes(loc) ||
          g.address.toLowerCase().includes(loc) ||
          (loc.includes("bengaluru") && g.city.toLowerCase().includes("bangalore")) ||
          (loc.includes("mumbai") && g.city.toLowerCase().includes("mumbai")) ||
          (loc.includes("delhi") && g.address.toLowerCase().includes("delhi")) ||
          (loc.includes("hyderabad") && g.city.toLowerCase().includes("hyderabad"))
      )
      if (matched) {
        setActiveCompanyId(matched.companyId)
        setIsDismissed(false)
        if (matched.jobs.length > 0 && onSelectJob) {
          onSelectJob(matched.jobs[0])
        }
      }
      return
    }

    if (markerGroups.length > 0) {
      const bounds = L.latLngBounds(markerGroups.map((g) => [g.coordinates.lat, g.coordinates.lng]))
      leafletMapRef.current.fitBounds(bounds, { maxZoom: 13, padding: [40, 40] })
    }
  }, [activeLocation, markerGroups, mapStyle])

  // --- World Tech Hub & Country Navigation ---
  const handleHubSelect = (hub: LocationHub | { name: string; query: string; lat: number; lng: number; zoom: number }) => {
    onLocationChange?.(hub.query)

    if (!hub.query) {
      if (leafletMapRef.current && mapStyle !== "vector") {
        leafletMapRef.current.flyTo([25, 0], 2, { duration: 1.4 })
      } else {
        setVectorZoomLevel(1)
        setVectorViewCenter({ x: 600, y: 310 })
      }
      setActiveCompanyId(null)
      setIsDismissed(true)
      onSelectJob?.(null)
      return
    }

    const matched = markerGroups.find((g) => {
      const city = g.city.toLowerCase()
      const addr = g.address.toLowerCase()
      const q = hub.query.toLowerCase()
      if (q.includes("bengaluru") || q.includes("bangalore")) {
        return city.includes("bengaluru") || city.includes("bangalore") || addr.includes("bengaluru") || addr.includes("bangalore")
      }
      return city.includes(q) || addr.includes(q)
    })

    if (matched) {
      setIsDismissed(false)
      setActiveCompanyId(matched.companyId)

      if (leafletMapRef.current && mapStyle !== "vector") {
        leafletMapRef.current.flyTo([matched.coordinates.lat, matched.coordinates.lng], 13, {
          duration: 1.4,
        })
      } else {
        setVectorViewCenter({ x: Math.max(160, matched.x - 100), y: matched.y })
        setVectorZoomLevel(1.9)
      }

      if (matched.jobs.length > 0 && onSelectJob) {
        onSelectJob(matched.jobs[0])
      }
    } else {
      if (leafletMapRef.current && mapStyle !== "vector") {
        leafletMapRef.current.flyTo([hub.lat, hub.lng], hub.zoom || 11, { duration: 1.4 })
      }
    }
  }

  // --- Zoom Controls ---
  const handleZoomIn = () => {
    if (leafletMapRef.current && mapStyle !== "vector") {
      leafletMapRef.current.zoomIn()
    } else {
      setVectorZoomLevel((z) => Math.min(z + 0.35, 3.6))
    }
  }

  const handleZoomOut = () => {
    if (leafletMapRef.current && mapStyle !== "vector") {
      leafletMapRef.current.zoomOut()
    } else {
      setVectorZoomLevel((z) => Math.max(z - 0.35, 0.85))
    }
  }

  const handleReset = () => {
    if (leafletMapRef.current && mapStyle !== "vector") {
      if (markerGroups.length > 0) {
        const bounds = L.latLngBounds(markerGroups.map((g) => [g.coordinates.lat, g.coordinates.lng]))
        leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 })
      } else {
        leafletMapRef.current.flyTo([25, 0], 2, { duration: 1 })
      }
    } else {
      setVectorZoomLevel(1)
      setVectorViewCenter({ x: 600, y: 310 })
    }
    setActiveCompanyId(null)
    setIsDismissed(true)
    onSelectJob?.(null)
  }

  // Copy Address
  const copyAddressToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2500)
  }

  // --- Vector Map Drag & Wheel Listeners (Fallback only) ---
  useEffect(() => {
    if (mapStyle !== "vector") return
    const container = vectorContainerRef.current
    if (!container) return

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const zoomFactor = e.deltaY < 0 ? 0.22 : -0.22
      setVectorZoomLevel((prev) =>
        Math.max(0.9, Math.min(3.8, Number((prev + zoomFactor).toFixed(2)))),
      )
    }

    container.addEventListener("wheel", handleNativeWheel, { passive: false })
    return () => container.removeEventListener("wheel", handleNativeWheel)
  }, [mapStyle])

  useEffect(() => {
    if (!isVectorDragging || mapStyle !== "vector") return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - vectorDragStart.x
      const dy = e.clientY - vectorDragStart.y

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setHasMovedDuringDrag(true)
      }

      const container = vectorContainerRef.current
      const width = container?.clientWidth || 1000
      const height = container?.clientHeight || 550

      const svgDx = (dx / width) * (1200 / vectorZoomLevel)
      const svgDy = (dy / height) * (620 / vectorZoomLevel)

      setVectorViewCenter((prev) => ({
        x: Math.max(80, Math.min(1120, prev.x - svgDx)),
        y: Math.max(60, Math.min(560, prev.y - svgDy)),
      }))
      setVectorDragStart({ x: e.clientX, y: e.clientY })
    }

    const handleGlobalMouseUp = () => {
      setIsVectorDragging(false)
    }

    window.addEventListener("mousemove", handleGlobalMouseMove)
    window.addEventListener("mouseup", handleGlobalMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove)
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isVectorDragging, vectorDragStart, vectorZoomLevel, mapStyle])

  return (
    <div
      className={`relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-lg ${className}`}
    >
      {/* Top Worldwide Locations Hub Bar */}
      {showToolbar && (
        <div className="p-3 border-b border-[var(--border)] bg-[var(--muted)]/40 flex flex-wrap items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
              <Globe size={15} />
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                Worldwide Real Map & Corporate Hubs
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--foreground)]">
                  {markerGroups.length} Pin Locations
                </span>
              </span>
            </div>
          </div>

          {/* Country Level Quick Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider shrink-0 mr-1">
              Country:
            </span>
            <button
              type="button"
              onClick={() => onLocationChange?.("")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                activeLocation === ""
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:border-[var(--primary)]"
              }`}
            >
              🌍 All Countries
            </button>
            {COUNTRIES_CATALOG.map((c) => {
              const isSelected = activeLocation.toLowerCase() === c.name.toLowerCase() || activeLocation.toLowerCase() === c.code.toLowerCase()
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => onLocationChange?.(c.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? "bg-[var(--primary)] text-white shadow-xs font-bold"
                      : "bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:border-[var(--primary)]"
                  }`}
                >
                  {c.name}
                </button>
              )
            })}
          </div>

          {/* State / Tech Hub Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-[var(--border)]/50">
            <span className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mr-1">
              Hubs:
            </span>
            {ALL_LOCATION_HUBS.filter((h) => h.query !== "").map((hub) => {
              const isSelected =
                activeLocation.toLowerCase().includes(hub.query.toLowerCase()) &&
                hub.query !== ""
              return (
                <button
                  key={hub.name}
                  type="button"
                  onClick={() => handleHubSelect(hub)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[var(--accent)] text-white shadow-xs font-semibold"
                      : "bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {hub.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div className={`relative w-full ${mapHeightClass} overflow-hidden select-none`}>
        {/* Real World Map Style Switcher (Top Left) */}
        <div className="absolute top-3 left-3 z-[1000] flex items-center bg-white/95 dark:bg-[#20102b]/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 dark:border-white/10 p-1 text-xs font-medium gap-1 max-w-[calc(100%-80px)] overflow-x-auto">
          <button
            type="button"
            onClick={() => setMapStyle("real-world")}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs font-semibold shrink-0 ${
              mapStyle === "real-world"
                ? "bg-[var(--primary)] text-white shadow-xs font-bold"
                : "text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            title="Worldwide Real Map (Carto Voyager)"
          >
            <Globe size={13} />
            <span>Worldwide Real Map</span>
          </button>

          <button
            type="button"
            onClick={() => setMapStyle("satellite")}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs shrink-0 ${
              mapStyle === "satellite"
                ? "bg-[var(--primary)] text-white shadow-xs font-bold"
                : "text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            title="Real Satellite Imagery (Esri World Imagery)"
          >
            <Satellite size={13} />
            <span>Satellite</span>
          </button>

          <button
            type="button"
            onClick={() => setMapStyle("dark")}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs shrink-0 ${
              mapStyle === "dark"
                ? "bg-[var(--primary)] text-white shadow-xs font-bold"
                : "text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            title="Real Dark Theme Map (Carto Dark Matter)"
          >
            <Moon size={13} />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => setMapStyle("streets")}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs shrink-0 ${
              mapStyle === "streets"
                ? "bg-[var(--primary)] text-white shadow-xs font-bold"
                : "text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            title="OpenStreetMap Real Street Map"
          >
            <MapIcon size={13} />
            <span>Streets</span>
          </button>

          <button
            type="button"
            onClick={() => setMapStyle("vector")}
            className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs shrink-0 ${
              mapStyle === "vector"
                ? "bg-[var(--primary)] text-white shadow-xs font-bold"
                : "text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            title="Minimalist Vector Art Fallback"
          >
            <Layers size={13} />
            <span>Vector</span>
          </button>
        </div>

        {/* Floating Zoom & Compass Controls (Bottom Right) */}
        <div className="absolute bottom-6 right-4 z-[1000] flex flex-col gap-2 items-end">
          {/* Compass / Recenter Button */}
          <button
            type="button"
            onClick={handleReset}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#20102b] text-slate-700 dark:text-slate-200 shadow-lg border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Recenter World Map"
          >
            <Compass size={18} className="text-blue-600 dark:text-blue-400" />
          </button>

          {/* Stacked + and − Zoom Buttons */}
          <div className="flex flex-col bg-white dark:bg-[#20102b] rounded-xl shadow-lg border border-black/10 dark:border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors font-bold text-base cursor-pointer"
              title="Zoom in"
            >
              +
            </button>
            <div className="w-full h-px bg-black/10 dark:bg-white/10" />
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-9 h-9 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors font-bold text-base cursor-pointer"
              title="Zoom out"
            >
              −
            </button>
          </div>
        </div>

        {/* 1. Leaflet Real Worldwide Slippy Map */}
        <div
          ref={mapElementRef}
          className={`w-full h-full ${mapStyle === "vector" ? "hidden" : "block"}`}
          style={{ zIndex: 1 }}
        />

        {/* 2. Vector Map Mode (Fallback when "vector" is selected) */}
        {mapStyle === "vector" && (
          <div
            ref={vectorContainerRef}
            onMouseDown={(e) => {
              if (e.button !== 0) return
              setIsVectorDragging(true)
              setHasMovedDuringDrag(false)
              setVectorDragStart({ x: e.clientX, y: e.clientY })
            }}
            onClick={() => {
              if (!hasMovedDuringDrag) {
                handleCloseCard()
              }
            }}
            className={`w-full h-full cursor-${isVectorDragging ? "grabbing" : "grab"}`}
          >
            <motion.div
              className="w-full h-full origin-center pointer-events-auto"
              animate={{
                scale: vectorZoomLevel,
                x: (600 - vectorViewCenter.x) * Math.max(0, vectorZoomLevel - 1) * 0.88,
                y: (310 - vectorViewCenter.y) * Math.max(0, vectorZoomLevel - 1) * 0.88,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <svg viewBox="0 0 1200 620" className="w-full h-full bg-[#AADAFF] dark:bg-[#17263C]">
                {/* Continents */}
                <g fill="#F5F3EE" stroke="#E2DDD2" strokeWidth="1.2" className="dark:fill-[#242F3E] dark:stroke-[#38414E]">
                  {/* North America */}
                  <path d="M 120,70 L 190,50 L 320,40 L 410,55 L 420,110 L 360,130 L 370,180 L 340,240 L 290,250 L 260,310 L 240,330 L 210,290 L 170,250 L 140,180 L 110,130 Z" />
                  <path d="M 420,35 L 490,30 L 480,95 L 440,110 Z" />
                  {/* South America */}
                  <path d="M 270,335 L 340,330 L 410,380 L 430,460 L 380,560 L 340,570 L 310,480 L 280,390 Z" />
                  {/* Europe */}
                  <path d="M 540,120 L 580,80 L 630,70 L 660,110 L 690,140 L 680,190 L 620,200 L 580,210 L 540,180 L 530,140 Z" />
                  {/* Africa */}
                  <path d="M 550,225 L 680,215 L 750,280 L 730,370 L 690,470 L 630,520 L 590,460 L 540,350 L 530,260 Z" />
                  {/* Asia */}
                  <path d="M 690,90 L 820,70 L 1010,80 L 1120,120 L 1100,190 L 1030,220 L 980,290 L 910,350 L 860,340 L 800,280 L 750,230 L 700,160 Z" />
                  {/* Australia */}
                  <path d="M 1030,440 L 1130,430 L 1170,490 L 1130,560 L 1050,550 L 1010,480 Z" />
                </g>

                {/* Markers */}
                {markerGroups.map((group) => {
                  const isSelected = activeCompanyId === group.companyId
                  return (
                    <g
                      key={group.companyId}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkerClick(group)
                      }}
                    >
                      <circle cx={group.x} cy={group.y} r={isSelected ? 10 : 7} fill={isSelected ? "#EA4335" : "#D93025"} />
                      <circle cx={group.x} cy={group.y} r={3} fill="#FFFFFF" />
                      <text
                        x={group.x}
                        y={group.y + 16}
                        fill="#1E293B"
                        className="dark:fill-white"
                        fontSize="9"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {group.companyName.length > 12 ? group.companyName.slice(0, 11) + "…" : group.companyName}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </motion.div>
          </div>
        )}

        {/* Place Info Window (Location & Place Details Card) */}
        <AnimatePresence>
          {activeGroup && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-16 left-3 z-[1050] w-80 sm:w-88 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#20102b] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden text-slate-800 dark:text-slate-100"
            >
              {/* Place Banner Image */}
              <div className="relative h-28 w-full bg-slate-800 overflow-hidden">
                {activeGroup.banner ? (
                  <img
                    src={activeGroup.banner}
                    alt={activeGroup.companyName}
                    className="w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-700 via-indigo-700 to-purple-800 flex items-center justify-center">
                    <Building2 className="text-white/20 w-14 h-14" />
                  </div>
                )}
                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleCloseCard}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 text-white flex items-center justify-center text-sm font-bold transition-all shadow-md cursor-pointer z-20"
                  title="Close place info"
                >
                  ✕
                </button>

                {/* Company Logo badge */}
                <div className="absolute -bottom-3 left-4 w-12 h-12 rounded-xl bg-white dark:bg-[#20102b] p-1.5 shadow-lg border border-black/10 dark:border-white/10 flex items-center justify-center">
                  <img
                    src={getCompanyRealLogo(activeGroup.companyName, undefined, activeGroup.logo)}
                    alt={activeGroup.companyName}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Place Information Body */}
              <div className="pt-5 p-4 space-y-3">
                {/* Title & Category */}
                <div>
                  <h4 className="font-poppins font-bold text-base text-slate-900 dark:text-white leading-tight">
                    {activeGroup.companyName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeGroup.industry} · Corporate Headquarters
                  </p>
                </div>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeGroup.rating || 4.8}
                  </span>
                  <div className="flex text-amber-400 text-xs">{"★".repeat(5)}</div>
                  <span className="text-slate-400 text-[11px]">
                    ({activeGroup.reviewCount || 180} reviews)
                  </span>
                </div>

                <div className="h-px bg-slate-100 dark:bg-white/10" />

                {/* Exact Physical Address */}
                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{activeGroup.address}</span>
                </div>

                {/* Exact Coordinates */}
                <div className="flex items-center gap-2.5 text-[11px] text-slate-400 font-mono">
                  <Navigation size={13} className="text-blue-500 shrink-0" />
                  <span>
                    {activeGroup.coordinates.lat.toFixed(4)}° N,{" "}
                    {activeGroup.coordinates.lng.toFixed(4)}° E
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyAddressToClipboard(activeGroup.address)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    {copiedAddress ? (
                      <>
                        <Check size={13} />
                        <span>Address Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (leafletMapRef.current && mapStyle !== "vector") {
                        leafletMapRef.current.flyTo(
                          [activeGroup.coordinates.lat, activeGroup.coordinates.lng],
                          14,
                          { duration: 1 },
                        )
                      }
                    }}
                    className="py-2 px-3 rounded-xl border border-slate-200 dark:border-white/15 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-98 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Compass size={13} />
                    <span>Focus</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
