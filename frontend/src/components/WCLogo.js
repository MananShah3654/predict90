/**
 * FIFA World Cup 26™ emblem — inline SVG reproduction of the official mark
 * (stacked "26" with the gold World Cup trophy), tuned for dark backgrounds.
 * variant: "full" (with wordmark) | "mark" (just 26 + trophy, for the navbar).
 */
export default function WCLogo({ className = "", variant = "full", numeralColor = "#FFFFFF" }) {
  return (
    <svg viewBox="0 0 220 250" className={className} role="img" aria-label="FIFA World Cup 26">
      <defs>
        <linearGradient id="wc-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="40%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="wc-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f7a4d" />
          <stop offset="100%" stopColor="#0c3d27" />
        </linearGradient>
      </defs>

      {/* stacked 26 */}
      <text x="42" y="150" textAnchor="middle"
        fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="150"
        fill={numeralColor} style={{ letterSpacing: "-4px" }}>2</text>
      <text x="178" y="150" textAnchor="middle"
        fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="150"
        fill={numeralColor} style={{ letterSpacing: "-4px" }}>6</text>

      {/* World Cup trophy (center) */}
      <g transform="translate(110 86)">
        <circle cx="0" cy="-32" r="15" fill="url(#wc-gold)" />
        <path d="M-20 -34 C -30 -8 -16 26 0 40 C 16 26 30 -8 20 -34 C 12 -16 8 -6 0 0 C -8 -6 -12 -16 -20 -34 Z"
          fill="url(#wc-gold)" />
        <rect x="-6" y="38" width="12" height="20" fill="url(#wc-gold)" />
        <path d="M-26 58 L26 58 L20 78 L-20 78 Z" fill="url(#wc-green)" stroke="#caa64a" strokeWidth="1.5" />
        <rect x="-30" y="78" width="60" height="8" rx="2" fill="url(#wc-gold)" />
      </g>

      {variant === "full" && (
        <>
          <text x="110" y="208" textAnchor="middle"
            fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="40"
            fill="#FFFFFF" style={{ letterSpacing: "2px" }}>FIFA</text>
          <text x="110" y="232" textAnchor="middle"
            fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="15"
            fill="#FFD700" style={{ letterSpacing: "6px" }}>WORLD CUP™</text>
        </>
      )}
    </svg>
  );
}
