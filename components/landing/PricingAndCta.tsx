'use client';
import { useState } from 'react';

export default function PricingAndCta() {
    const [isYearly, setIsYearly] = useState(false);

    const plans = {
        monthly: [
            { name: 'Monthly', price: '1,499', period: '/month', features: ['Unlimited AI Evaluations', 'Performance Analytics', 'PYQ Library Access'], popular: false },
            { name: 'Quarterly', price: '3,599', period: '/qtr', features: ['Everything in Monthly', 'Essay Evaluation Module', 'Download Reports'], popular: true },
            { name: 'Yearly', price: '9,999', period: '/year', features: ['Everything in Quarterly', 'Bookmark Feature', 'Priority Support'], popular: false },
        ],
        yearly: [
            { name: 'Monthly', price: '1,199', period: '/month', features: ['Unlimited AI Evaluations', 'Performance Analytics', 'PYQ Library Access'], popular: false },
            { name: 'Quarterly', price: '2,999', period: '/qtr', features: ['Everything in Monthly', 'Essay Evaluation Module', 'Download Reports'], popular: true },
            { name: 'Yearly', price: '7,999', period: '/year', features: ['Everything in Quarterly', 'Bookmark Feature', 'Priority Support'], popular: false },
        ]
    };

    const currentPlans = isYearly ? plans.yearly : plans.monthly;

    return (
        <>
            <section className="section" id="pricing-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Choose Your Plan</h2>
                        <p>Start with a free trial, then pick a plan that fits your preparation journey.</p>
                    </div>
                    <div className="pricing-toggle">
                        <span>Monthly</span>
                        <label htmlFor="pricing-toggle" className="toggle-switch">
                            <input type="checkbox" id="pricing-toggle" className="hidden" checked={isYearly} onChange={() => setIsYearly(!isYearly)} />
                            <div className="toggle-switch-handle"></div>
                        </label>
                        <span>Yearly (Save 33%)</span>
                    </div>
                    <div className="pricing-grid">
                        {currentPlans.map((plan, index) => (
                            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                                <h3>{plan.name}</h3>
                                <div className="price">₹{plan.price}<span>{plan.period}</span></div>
                                <ul>
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="m10 16.4l-4-4L7.4 11l2.6 2.6L16.6 7L18 8.4z"/></svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button className="choose-plan-btn">Choose Plan</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section" id="final-cta-section">
                <div className="container section-header">
                    <h2>Ready to Begin Your Journey?</h2>
                    <p>Join thousands of successful aspirants who transformed their preparation with AI-powered evaluation.</p>
                    <div className="cta-buttons">
                        <a href="#" className="btn-primary">Start Free Trial</a>
                        <a href="#" className="btn-secondary">Explore All Features</a>
                    </div>
                </div>
            </section>
        </>
    );
}