'use client';

// Placeholder data for testimonials
const testimonials = [
    {
        name: 'Priya S.',
        achievement: 'Cleared BPSC 2024',
        avatar: 'https://i.pravatar.cc/150?u=a',
        review: '"The AI feedback was brutally honest and incredibly helpful. It pointed out structural flaws in my answers I never would have noticed."'
    },
    {
        name: 'Ankit M.',
        achievement: 'UPSC Aspirant',
        avatar: 'https://i.pravatar.cc/150?u=b',
        review: '"Root & Rise is a game-changer. The performance analytics helped me focus my efforts and improve my weak areas systematically."'
    },
    {
        name: 'Rhea G.',
        achievement: 'Cleared GPSC 2024',
        avatar: 'https://i.pravatar.cc/150?u=c',
        review: '"Practicing with the PYQs and getting instant feedback on the platform was the key to my success in the Mains."'
    }
];

export default function Testimonials() {
    return (
        <section className="section" id="testimonials-section">
            <div className="container">
                <div className="section-header">
                    <h2>Trusted by Aspirants Like You</h2>
                </div>
                <div className="testimonials-grid">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="testimonial-card">
                            <div className="testimonial-header">
                                <img src={testimonial.avatar} alt={testimonial.name} />
                                <div>
                                    <strong>{testimonial.name}</strong>
                                    <span>{testimonial.achievement}</span>
                                </div>
                            </div>
                            <div className="stars">★★★★★</div>
                            <p>{testimonial.review}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}