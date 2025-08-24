'use client';

import { useState } from 'react';

// Mock data for demonstration
const contentData: { [key: string]: { [key: string]: { headline: string; subheadline: string } } } = {
    'GPSC': {
        'Gujarati': { headline: `તમારા GPSC લક્ષ્ય માટે ચોકસાઈ સાધનો`, subheadline: `GPSC મેન્સ પર વિજય મેળવવા માટે વિશિષ્ટ પ્રતિસાદ મેળવો.` }
    },
    'UPSC': {
        'English': { headline: `Tools for the UPSC Summit`, subheadline: `We've curated a special set of tools and features just for you.` }
    }
};
const examLanguageMap: { [key: string]: string[] } = {
    'UPSC': ['English', 'Hindi'],
    'UPPCS': ['English', 'Hindi'],
    'GPSC': ['English', 'Gujarati'],
    'BPSC': ['English', 'Hindi']
};

export default function Hero() {
    const [selectedExam, setSelectedExam] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [isLanguageChooserVisible, setLanguageChooserVisible] = useState(false);
    const [isContainerActive, setContainerActive] = useState(false);

    const handleExamSelect = (exam: string) => {
        setSelectedExam(exam);
        setSelectedLanguage(null);
        setContainerActive(false);
        setLanguageChooserVisible(true);
    };

    const handleLanguageSelect = (language: string) => {
        setSelectedLanguage(language);
        setContainerActive(true);
    };

    const announcement = selectedExam && selectedLanguage && contentData[selectedExam]?.[selectedLanguage]
        ? contentData[selectedExam][selectedLanguage]
        : { headline: '', subheadline: '' };

    return (
        <section className="section" id="hero-section">
            <div className={`container main-container ${isContainerActive ? 'active' : ''}`}>
                <div className="hero-content">
                    <h1>ACE Your Preparation</h1>
                    <p>The ultimate AI-powered platform for UPSC, State PCS, and other competitive exam aspirants.</p>
                </div>
                <div className="path-selector">
                    <div className="chooser-step">
                        <h3>1. Select your destination</h3>
                        <div id="exam-chooser" className="options-grid">
                            {Object.keys(examLanguageMap).map(exam => (
                                <button key={exam} onClick={() => handleExamSelect(exam)} className="option-button">{exam}</button>
                            ))}
                        </div>
                    </div>
                    <div id="language-chooser" className={`chooser-step ${isLanguageChooserVisible ? 'visible' : ''}`}>
                        <h3>2. Choose your language</h3>
                        <div id="language-options" className="options-grid">
                            {selectedExam && examLanguageMap[selectedExam].map(lang => (
                                <button key={lang} onClick={() => handleLanguageSelect(lang)} className="option-button">{lang}</button>
                            ))}
                        </div>
                    </div>
                    <div className="selected-display">
                        <div className="selected-item">{selectedExam}</div>
                        <div className="selected-item">{selectedLanguage}</div>
                    </div>
                </div>
                <div id="announcement-section" className={isContainerActive ? 'visible' : ''}>
                    <h2 id="announcement-headline">{announcement.headline}</h2>
                    <p id="announcement-subheadline">{announcement.subheadline}</p>
                </div>
            </div>
            <a href="#features-section" className={`scroll-down-arrow ${isContainerActive ? 'visible' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
            </a>
        </section>
    );
}