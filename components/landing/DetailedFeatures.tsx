'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { BarChart, CheckCircle, Users, PenTool, BrainCircuit, BookOpen, Check } from 'lucide-react';

const detailedFeatures = [
    {
        title: 'In-depth Analysis Engine',
        description: 'Our AI goes beyond simple grammar checks. It deconstructs your answer to analyze structure, argument strength, keyword usage, and adherence to the question\'s core demand.',
        points: [
            'Structural integrity analysis.',
            'Evaluation of argument flow and coherence.',
            'Keyword density and relevance check.',
            'Contextual understanding of the subject matter.'
        ],
        image: '/hero (1).png', // Replace with a relevant image
        icon: BrainCircuit,
    },
    {
        title: 'Topper Answer Comparison',
        description: 'Benchmark your writing against the best. We provide a side-by-side comparison of your answer with model answers from previous exam toppers, highlighting key differences in style and content.',
        points: [
            'Direct comparison with multiple topper answers.',
            'Highlighting of unique points and perspectives.',
            'Learn effective answer framing and presentation.',
            'Identify gaps in your knowledge and writing.'
        ],
        image: '/hero-illustraion.png', // Replace with a relevant image
        icon: CheckCircle,
    },
    {
        title: 'Community & Peer Insights',
        description: 'You are not alone in your preparation. Our platform anonymizes and aggregates data from thousands of evaluations to provide you with valuable insights into common mistakes and successful patterns.',
        points: [
            'Understand common pitfalls for specific questions.',
            'See what high-scoring answers have in common.',
            'Anonymous peer data for competitive analysis.',
            'Discover trends in how questions are interpreted.'
        ],
        image: '/hero (1).png', // Replace with a relevant image
        icon: Users,
    },
];

export default function DetailedFeatures() {
    return (
        <div className="w-full bg-white">
            {/* Page Hero Section */}
            <div className="text-center py-20">
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
                    A Smarter Way to Write
                </h1>
                <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600">
                    Discover how our powerful features can transform your answer writing process from guesswork to a data-driven strategy.
                </p>
            </div>

            {/* Features List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
                {detailedFeatures.map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        className="grid md:grid-cols-2 gap-12 md:gap-16 items-center"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Text content */}
                        <div className={index % 2 === 0 ? 'md:order-1' : 'md:order-2'}>
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
                                {feature.title}
                            </h2>
                            <p className="mt-4 text-lg text-gray-600">
                                {feature.description}
                            </p>
                            <ul className="mt-6 space-y-4">
                                {feature.points.map((point) => (
                                    <li key={point} className="flex items-start">
                                        <Check className="flex-shrink-0 h-6 w-6 text-green-500 mt-1" />
                                        <span className="ml-3 text-gray-700">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Image content */}
                        <div className={`relative h-80 rounded-2xl shadow-xl overflow-hidden ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                             <Image
                                src={feature.image}
                                alt={feature.title}
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}