import { motion } from 'framer-motion'

const features = [
  {
    title: 'Premium Quality',
    description: 'High-resolution polaroid-style photos with perfect color grading and effects.',
    icon: '🎨'
  },
  {
    title: 'Instant Sharing',
    description: 'Share your polaroids instantly with friends and family across platforms.',
    icon: '⚡'
  },
  {
    title: 'Custom Themes',
    description: 'Choose from various themes to match your style and mood.',
    icon: '🎯'
  },
  {
    title: 'Easy to Use',
    description: 'Simple and intuitive interface for creating beautiful polaroids.',
    icon: '✨'
  }
]

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose Instaroid?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 