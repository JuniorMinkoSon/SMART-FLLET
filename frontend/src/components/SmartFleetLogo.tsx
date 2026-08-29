export function SmartFleetLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
      {/* Truck/Fleet shape */}
      <rect x="2" y="12" width="20" height="12" rx="2" fill="var(--primary)" />
      <circle cx="8" cy="26" r="2.5" fill="var(--primary)" />
      <circle cx="18" cy="26" r="2.5" fill="var(--primary)" />

      {/* Cab */}
      <rect x="20" y="10" width="8" height="8" rx="1" fill="var(--primary)" />
      <rect x="22" y="11" width="4" height="4" rx="0.5" fill="rgba(255,255,255,0.3)" />

      {/* Speedometer/signal lines */}
      <path d="M 26 20 L 28 22" stroke="var(--primary)" strokeWidth="1" />
      <path d="M 26 22 L 28 24" stroke="var(--primary)" strokeWidth="1" />
    </svg>
  )
}
