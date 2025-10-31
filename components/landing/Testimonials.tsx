'use client';
import { motion } from 'framer-motion';
// The Image import is no longer needed
// import Image from 'next/image';

const testimonials = [
  {
    quote: "The feedback was brutally honest but incredibly helpful. I corrected micro-mistakes I didn't even know I was making. My essay score jumped by 25 marks.",
    author: 'Rohan Sharma',
    credential: 'UPSC Aspirant',
    // The 'avatar' property has been removed
  },
  {
    quote: 'As a working professional, time is everything. Getting instant feedback without waiting for a mentor is a game-changer. It’s like having a 24/7 teacher.',
    author: 'Priya Patel',
    credential: 'BPSC Candidate',
  },
  {
    quote: 'I used to struggle with structuring my answers. The AI pointed out exactly where my arguments were weak and how to link paragraphs better. Highly recommend!',
    author: 'Ankit Singh',
    credential: 'University Student',
  },
];

export default function Testimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  return (
    <section className="bg-white py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-emerald-600 font-semibold tracking-wide uppercase">
            Testimonials
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by Ambitious Achievers
          </p>
          <p className="mt-4 max-w-2xl text-lg text-gray-500 mx-auto">
            See how our platform has made a difference in their preparation.
          </p>
        </div>

        <motion.div
          className="mt-20 grid gap-10 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-slate-50 rounded-xl shadow-lg overflow-hidden flex flex-col justify-between" // Added flex classes for alignment
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="p-8">
                <p className="text-lg text-gray-700 italic leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
              </div>
              {/* [FIX] The entire image section has been removed */}
              <div className="bg-gray-100 px-8 py-4">
                {/* The text is now directly inside this container */}
                <div className="text-base font-bold text-gray-900">{testimonial.author}</div>
                <div className="text-sm font-semibold text-emerald-600">{testimonial.credential}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}