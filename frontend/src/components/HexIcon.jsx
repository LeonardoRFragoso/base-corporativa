export default function HexIcon({ children, className = "", gradient = "from-gold-500 to-bronze-500" }) {
  return (
    <div className={`relative ${className}`}>
      {/* Hexagonal background */}
      <div 
        className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center transform rotate-0 relative overflow-hidden`}
        style={{
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
        }}
      >
        {/* Inner content */}
        <div className="text-white z-10 relative">
          {children}
        </div>
        
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1 left-1 w-2 h-2 border border-white/30 transform rotate-45"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 border border-white/30 transform rotate-45"></div>
        </div>
      </div>
    </div>
  )
}
