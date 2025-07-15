import { motion } from 'framer-motion'
import Image from 'next/image'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Photography Enthusiast',
    image: '/testimonials/user1.jpg',
    content: 'Instaroid has transformed how I share my photos. The polaroid effect is absolutely stunning!'
  },
  {
    name: 'Mike Chen',
    role: 'Content Creator',
    image: '/testimonials/user2.jpg',
    content: 'The variety of themes and the ease of use make this my go-to app for creating beautiful memories.'
  },
  {
    name: 'Emma Davis',
    role: 'Social Media Influencer',
    image: '/testimonials/user3.jpg',
    content: `My followers love the unique polaroid style I can create with Instaroid. It's become a signature part of my content!`
  }
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">&ldquo;{testimonial.content}&rdquo;</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 