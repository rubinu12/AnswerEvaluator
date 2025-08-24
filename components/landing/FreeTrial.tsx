'use client';
import { useState } from 'react';
import InteractiveTrialModal from './InteractiveTrialModal';
import TrialEvaluator from './TrialEvaluator'; // Import the new component

export default function FreeTrial() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSignedUpForTrial, setIsSignedUpForTrial] = useState(false);

    // This function will be called by the modal on a successful sign-up
    const handleSignUpSuccess = () => {
        setIsSignedUpForTrial(true);
        // We keep the modal open to continue the flow
    };

    return (
        <>
            <section className="section" id="free-trial-section">
                <div className="container w-full">
                    {isSignedUpForTrial ? (
                        // If signed up, show the new evaluator UI
                        <TrialEvaluator />
                    ) : (
                        // Otherwise, show the initial prompt
                        <div id="trial-prompt" style={{ textAlign: 'center' }}>
                            <div className="section-header">
                                <h2>Try It Yourself, For Free</h2>
                                <p>Get your first 300-word essay evaluated by our AI, completely free. No credit card required.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(true)} className="cta-button">
                                Sign Up & Get Free Evaluation
                            </button>
                        </div>
                    )}
                </div>
            </section>
            
            {/* The Modal is now controlled here, and we pass the new success handler */}
            {isModalOpen && (
                <InteractiveTrialModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onSignUpSuccess={handleSignUpSuccess} 
                />
            )}
        </>
    );
}