export default function Logo({ className = "h-10 w-auto" }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 200 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hexagonal background */}
      <g filter="url(#shadow)">
        <path 
          d="M20 10L35 5L50 10L50 25L35 30L20 25Z" 
          fill="url(#goldGradient)" 
          stroke="url(#strokeGradient)" 
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M22 15L35 9L48 15"
          fill="none"
          stroke="url(#highlightGradient)"
          strokeWidth="1.2"
          opacity="0.5"
          strokeLinecap="round"
        />
      </g>
      
      {/* Inner geometric pattern */}
      <path 
        d="M25 15L30 12L35 15L35 20L30 23L25 20Z" 
        fill="url(#innerGradient)" 
        opacity="0.9"
      />
      
      {/* Text */}
      <text 
        x="65" 
        y="22" 
        fontSize="15" 
        fontWeight="bold" 
        fill="url(#textGradient)"
        stroke="#2a1a0a"
        strokeWidth="0.4"
        fontFamily="system-ui, -apple-system, sans-serif"
        style={{ letterSpacing: '1px' }}
      >
        BASE
      </text>
      <text 
        x="65" 
        y="38" 
        fontSize="15" 
        fontWeight="bold" 
        fill="url(#textGradient)"
        stroke="#2a1a0a"
        strokeWidth="0.4"
        fontFamily="system-ui, -apple-system, sans-serif"
        style={{ letterSpacing: '1px' }}
      >
        CORPORATIVA
      </text>
      
      {/* Gradients */}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b97a2a" />
          <stop offset="100%" stopColor="#8c4e12" />
        </linearGradient>
        <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a05a1a" />
          <stop offset="100%" stopColor="#72370b" />
        </linearGradient>
        <filter id="shadow" x="0" y="0" width="200%" height="200%">
          <feOffset dx="0" dy="1" />
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 0.25 0" />
          <feBlend in="SourceGraphic" mode="normal" />
        </filter>
      </defs>
    </svg>
  )
}
