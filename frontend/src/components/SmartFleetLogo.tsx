interface SmartFleetLogoProps {
  size?: number
}

/**
 * Logo Smart Fleet — hérite de la couleur du texte parent (`currentColor`),
 * ce qui le rend visible aussi bien sur fond sombre (sidebar) que clair.
 */
export function SmartFleetLogo({ size = 32 }: SmartFleetLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Smart Fleet"
      style={{ marginRight: 8, flexShrink: 0 }}
    >
      {/* Benne */}
      <rect x="2" y="12" width="20" height="12" rx="2" fill="currentColor" />
      <circle cx="8" cy="26" r="2.5" fill="currentColor" />
      <circle cx="18" cy="26" r="2.5" fill="currentColor" />

      {/* Cabine */}
      <rect x="20" y="10" width="8" height="8" rx="1" fill="currentColor" />
      <rect x="22" y="11" width="4" height="4" rx="0.5" fill="rgba(255,255,255,0.35)" />

      {/* Lignes de signal */}
      <path d="M 26 20 L 28 22" stroke="currentColor" strokeWidth="1" />
      <path d="M 26 22 L 28 24" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
