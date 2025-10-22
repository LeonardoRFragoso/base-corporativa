export default function Logo({ className = "h-8 w-auto" }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 200 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hexagonal background */}
      <path 
        d="M20 10L35 5L50 10L50 25L35 30L20 25Z" 
        fill="url(#goldGradient)" 
        stroke="#B45309" 
        strokeWidth="1"
      />
      
      {/* Inner geometric pattern */}
      <path 
        d="M25 15L30 12L35 15L35 20L30 23L25 20Z" 
        fill="#92400E" 
        opacity="0.8"
      />
      
      {/* Text */}
      <text 
        x="65" 
        y="20" 
        fontSize="14" 
        fontWeight="bold" 
        fill="url(#textGradient)"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        BASE
      </text>
      <text 
        x="65" 
        y="35" 
        fontSize="14" 
        fontWeight="bold" 
        fill="url(#textGradient)"
        fontFamily="system-ui, -apple-system, sans-serif"
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
      </defs>
    </svg>
  )
}
