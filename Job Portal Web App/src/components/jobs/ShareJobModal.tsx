import { useState } from "react"
import { Copy, Check, X, Share2, MessageSquare, Send, Globe, ExternalLink } from "lucide-react"
import toast from "react-hot-toast"
import Button from "../ui/Button"

interface ShareJobModalProps {
  jobTitle: string
  companyName: string
  jobId: string
  isOpen: boolean
  onClose: () => void
}

export default function ShareJobModal({
  jobTitle,
  companyName,
  jobId,
  isOpen,
  onClose,
}: ShareJobModalProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/jobs/${jobId}` : ""

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success("Job link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const shareText = encodeURIComponent(
    `Check out this ${jobTitle} opening at ${companyName} on HireHub!`
  )

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageSquare,
      url: `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(shareUrl)}`,
      color: "bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20",
    },
    {
      name: "LinkedIn",
      icon: ExternalLink,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20",
    },
    {
      name: "X (Twitter)",
      icon: Globe,
      url: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`,
      color: "bg-black/10 dark:bg-white/10 text-foreground hover:bg-black/20",
    },
    {
      name: "Telegram",
      icon: Send,
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareText}`,
      color: "bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20",
    },
  ]

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${jobTitle} at ${companyName}`,
          text: `Check out this ${jobTitle} opening at ${companyName} on HireHub!`,
          url: shareUrl,
        })
      } catch {
        // Ignored if cancelled
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-[var(--primary)]" />
            <h3 className="font-bold text-base text-[var(--foreground)]">Share Job Opening</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-4">
          <p className="text-sm font-semibold text-[var(--foreground)] truncate">{jobTitle}</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{companyName}</p>

          <div className="grid grid-cols-2 gap-2.5 mt-5">
            {shareOptions.map((opt) => (
              <a
                key={opt.name}
                href={opt.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 p-3 rounded-xl border border-[var(--border)] text-xs font-semibold transition-colors ${opt.color}`}
              >
                <opt.icon size={15} />
                <span>{opt.name}</span>
              </a>
            ))}
          </div>

          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={handleNativeShare}
              className="mt-3 w-full py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 hover:bg-[var(--muted)] text-xs font-medium text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 size={14} /> More Share Options (System Dialog)
            </button>
          )}

          <div className="mt-5">
            <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">
              Or copy link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] select-all focus:outline-none"
              />
              <Button
                variant={copied ? "secondary" : "primary"}
                size="sm"
                onClick={handleCopy}
                className="shrink-0 h-auto py-2 text-xs"
              >
                {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
