'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    title: 'UPSC Aspirant',
    image: '/testimonials/priya.jpg', // You will need to add these images to your /public/testimonials folder
    rating: 5,
    quote:
      "This platform has been a game-changer for my Mains preparation. The AI feedback is incredibly detailed and points out nuanced mistakes I wouldn't have noticed otherwise. My scores have improved dramatically.",
  },
  {
    name: 'Rohan Mehra',
    title: 'State PSC Candidate',
    image: '/testimonials/rohan.jpg',
    rating: 5,
    quote:
      'The ability to get instant feedback on my answer structure and keyword usage is invaluable. It’s like having a personal mentor available 24/7. The personalized roadmap is helping me focus on my weakest areas.',
  },
  {
    name: 'Anjali Desai',
    title: 'Working Professional Aspirant',
    image: '/testimonials/anjali.jpg',
    rating: 5,
    quote:
      'As a working professional, time is my most valuable asset. Root & Rise gives me quick, actionable insights without having to wait weeks for feedback from a test series. Highly recommended!',
  },
  {
    name: 'Vikram Singh',
    title: 'UPSC Veteran',
    image: '/testimonials/vikram.jpg',
    rating: 5,
    quote:
      "I've tried many platforms, but the quality of analysis here is unparalleled. The AI understands the specific demands of the UPSC exam, making the feedback not just accurate but also highly relevant.",
  },
];

export default function Testimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    // FIX: 
    // 1. bg-transparent lets the universal background show through.
    // 2. pt-24 adds a large, fixed gap below the navbar.
    // 3. pb-16 adds a fixed gap at the bottom.
    // 4. overflow-y-auto is a fallback for very small screens to prevent overlap.
    <div className="w-full h-full bg-transparent overflow-y-auto pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-emerald-800">
            Trusted by Aspirants
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            What Our Users Say
          </h2>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 max-w-5xl mx-auto"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 relative"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-white/50" />
              <div className="flex items-center">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="rounded-full h-12 w-12 object-cover"
                />
                <div className="ml-4">
                  <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-gray-700 text-sm">{testimonial.title}</p>
                </div>
              </div>
              <div className="flex items-center mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                  />
                ))}
              </div>
              <p className="mt-4 text-gray-800 italic leading-relaxed z-10 relative">
                "{testimonial.quote}"
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}