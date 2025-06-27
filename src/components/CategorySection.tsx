export default function CategorySection() {
  const categories = [
    { label: 'NEW ARRIVALS', color: 'from-red-600 to-pink-600', icon: '✨' },
    { label: 'TRENDING', color: 'from-orange-500 to-red-500', icon: '🔥' },
    { label: 'TOP RATED', color: 'from-purple-500 to-red-400', icon: '⭐' }
  ]

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
      <div className="flex space-x-6">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`anime-category-button bg-gradient-to-r ${category.color} text-white font-bold py-3 px-8 rounded-full text-lg italic transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-3 group relative overflow-hidden`}
          >
            {/* Anime-style background pulse */}
            <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500"></div>
            
            {/* Content */}
            <span className="text-xl group-hover:animate-pulse relative z-10">{category.icon}</span>
            <span className="relative z-10 anime-font">{category.label}</span>
            
            {/* Sparkle effect */}
            <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
            <div className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{ animationDelay: '0.2s' }}></div>
          </button>
        ))}
      </div>
    </div>
  )
}