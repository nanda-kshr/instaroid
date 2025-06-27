export default function Navigation() {
  const navItems = [
    { label: 'BROWSE', color: 'from-red-500 to-red-600', icon: '🖼️' },
    { label: 'COLLECTIONS', color: 'from-orange-500 to-red-500', icon: '📚' },
    { label: 'CART', color: 'from-pink-500 to-red-400', icon: '🛒' }
  ]

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 space-y-4">
      {navItems.map((item, index) => (
        <button
          key={index}
          className={`anime-nav-button bg-gradient-to-r ${item.color} text-white font-bold py-4 px-8 rounded-r-full text-lg italic transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-3 group relative overflow-hidden`}
        >
          {/* Anime-style background effect */}
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          
          {/* Content */}
          <span className="text-2xl group-hover:animate-bounce relative z-10">{item.icon}</span>
          <span className="relative z-10 anime-font">{item.label}</span>
          
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
        </button>
      ))}
    </div>
  )
}