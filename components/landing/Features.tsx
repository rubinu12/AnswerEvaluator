'use client';

const features = [
    { title: 'Mains Answer Analysis', text: 'Go beyond scores with deep, structural analysis of your answers.', icon: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>' },
    { title: 'Highly Accurate OCR', text: 'Our AI reads your handwriting with precision, ensuring no detail is missed in the evaluation.', icon: '<path d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"/>' },
    { title: 'Multilanguage Support', text: 'Prepare in the language you are most comfortable with, including English, Hindi, and Gujarati.', icon: '<path d="m5 8 6 6"/><path d="m12 8 6 6"/>' },
    { title: 'Detailed PYQs', text: 'Access a comprehensive, tagged library of Previous Year Questions, sorted by subject and year.', icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>', tag: 'UPSC Only' },
    { title: 'Essay Evaluation', text: 'Specialized models for both Issue-Based and Philosophical essays to master the art of articulation.', icon: '<path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/><path d="M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>' },
    { title: '5-Parameter Review', text: 'Answers are reviewed on Language, Structure, Content, Clarity, and Keyword Usage.', icon: '<path d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/>' },
    { title: 'Value Addition', text: 'Receive suggestions for relevant examples, case studies, and mind maps to enrich your answers.', icon: '<path d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
    { title: 'Download & Bookmark', text: 'Save your evaluated reports as PDFs for offline revision or bookmark key insights.', icon: '<path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>' },
];

export default function Features() {
    return (
        <section className="section" id="features-section">
            <div className="container">
                <div className="section-header">
                    <h2>Everything You Need to Succeed</h2>
                    <p>Our platform is packed with powerful features designed to give you a competitive edge.</p>
                </div>
                <div className="features-container-wrapper">
                    <div className="features-container">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" dangerouslySetInnerHTML={{ __html: feature.icon }} />
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.text}</p>
                                {feature.tag && <span className="feature-badge">{feature.tag}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}