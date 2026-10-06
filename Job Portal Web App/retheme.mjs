import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const cssPath = path.join(__dirname, "src", "index.css")
let cssContent = fs.readFileSync(cssPath, "utf8")

cssContent = cssContent.replace(
  /:root \{[\s\S]*?\}/,
  `:root {
  --primary: #101F3E;
  --primary-hover: #172A52;
  --primary-deep: #081122;
  --accent: #FC8217;
  --accent-hover: #E37413;
  --background: #F4F6F9;
  --foreground: #101F3E;
  --card: #FFFFFF;
  --card-foreground: #101F3E;
  --muted: #E8EBEF;
  --muted-foreground: #747C8D;
  --border: #CED4DA;
  --success: #22C55E;
  --error: #EF4444;
  --warning: #F59E0B;
  --ring: #FC8217;
  --shadow-glow: 0 0 40px rgba(252, 130, 23, 0.15);
  --shadow-card: 0 4px 24px rgba(16, 31, 62, 0.08);
  --shadow-elevated: 0 16px 48px rgba(16, 31, 62, 0.14);
}`,
)

cssContent = cssContent.replace(
  /\.dark \{[\s\S]*?\}/,
  `.dark {
  --primary: #FC8217;
  --primary-hover: #E37413;
  --primary-deep: #B5580A;
  --accent: #FC8217;
  --accent-hover: #FF9F45;
  --background: #081122;
  --foreground: #F4F6F9;
  --card: #101F3E;
  --card-foreground: #F4F6F9;
  --muted: #172A52;
  --muted-foreground: #9AA4B8;
  --border: #223761;
  --success: #22C55E;
  --error: #EF4444;
  --warning: #F59E0B;
  --ring: #FC8217;
  --shadow-glow: 0 0 60px rgba(252, 130, 23, 0.25);
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-elevated: 0 16px 48px rgba(0, 0, 0, 0.6);
}`,
)

fs.writeFileSync(cssPath, cssContent)

function processDirectory(dir) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath)
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      let content = fs.readFileSync(fullPath, "utf8")
      let originalContent = content

      // Gradients / Hardcoded hexes matching old theme
      content = content.replace(/#0A1F44/g, "#101F3E")
      content = content.replace(/#0B1840/g, "#0C1830")
      content = content.replace(/#0B1220/g, "#081122")

      content = content.replace(/#1E5EFF/g, "var(--primary)")
      content = content.replace(/#1447CC/g, "var(--primary-hover)")
      content = content.replace(/#4D81FF/g, "var(--accent)")
      content = content.replace(/#FFC72C/g, "var(--accent)")

      // Replace Tailwind utility classes
      content = content.replace(/text-blue-200/g, "text-white/80")
      content = content.replace(/text-blue-300/g, "text-white/70")
      content = content.replace(/text-blue-400/g, "text-white/60")
      content = content.replace(/bg-blue-100/g, "bg-[var(--muted)]")
      content = content.replace(/dark:bg-blue-900\/30/g, "") // Handled by muted
      content = content.replace(/to-blue-600/g, "to-[var(--primary-deep)]")
      content = content.replace(/to-blue-500/g, "to-[var(--primary)]")
      content = content.replace(/to-blue-400/g, "to-[var(--accent)]")
      content = content.replace(/shadow-blue-500/g, "shadow-[var(--primary)]")
      content = content.replace(
        /shadow-blue-600/g,
        "shadow-[var(--primary-deep)]",
      )
      content = content.replace(/border-blue-500/g, "border-[var(--primary)]")
      content = content.replace(/bg-blue-500/g, "bg-[var(--primary)]")
      content = content.replace(/bg-blue-50/g, "bg-[var(--muted)]")
      content = content.replace(/dark:bg-blue-950\/20/g, "")

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content)
      }
    }
  }
}

processDirectory(path.join(__dirname, "src"))
console.log("Retheming complete.")
