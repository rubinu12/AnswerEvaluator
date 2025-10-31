'use client';

import { useState, useEffect } from 'react';
import { useAuthContext, UserProfile } from '@/lib/AuthContext';
import { useEvaluationStore } from '@/lib/store';
import { User } from 'firebase/auth'; // Import the User type from firebase

// Import all necessary components
import EvaluateCard from '@/components/dashboard/EvaluateCard';
import ReviewCard from '@/components/dashboard/ReviewCard';
import StudyStreakCalendar from '@/components/dashboard/StudyStreakCalendar';
import MentorsWisdom from '@/components/dashboard/MentorsWisdom';
import PerformanceGauges from '@/components/dashboard/PerformanceGauges';
import RecentEvaluations from '@/components/dashboard/RecentEvaluations';
import InProgressCard from '@/components/dashboard/InProgressCard';
import MobileSubNav from '@/components/dashboard/MobileSubNav';

// --- Subscription Status Banner Component (No changes needed) ---
const SubscriptionStatusBanner = ({ profile }: { profile: UserProfile | null }) => {
    if (!profile) return null;

    const { subscriptionStatus, remainingEvaluations } = profile;
    let message, buttonText, buttonLink, bgColor, textColor, buttonColor;

    switch (subscriptionStatus) {
        case 'TRIAL':
            message = `You have ${remainingEvaluations} free evaluations remaining.`;
            buttonText = 'Upgrade to Premium';
            buttonLink = '/pricing';
            bgColor = 'bg-blue-100 border-blue-200';
            textColor = 'text-blue-800';
            buttonColor = 'bg-blue-500 hover:bg-blue-600';
            break;
        case 'EXPIRED':
            message = 'Your subscription has expired. Please renew to continue evaluations.';
            buttonText = 'Renew Now';
            buttonLink = '/pricing';
            bgColor = 'bg-red-100 border-red-200';
            textColor = 'text-red-800';
            buttonColor = 'bg-red-500 hover:bg-red-600';
            break;
        case 'PACK_USER':
            message = `You have ${remainingEvaluations} evaluations remaining in your pack.`;
            buttonText = 'Buy More Answers';
            buttonLink = '/pricing';
            bgColor = 'bg-yellow-100 border-yellow-200';
            textColor = 'text-yellow-800';
            buttonColor = 'bg-yellow-500 hover:bg-yellow-600';
            break;
        case 'PREMIUM':
            message = `You're on the Premium Plan. You have ${remainingEvaluations} evaluations left this month.`;
            buttonText = 'Manage Subscription';
            buttonLink = '/profile';
            bgColor = 'bg-green-100 border-green-200';
            textColor = 'text-green-800';
            buttonColor = 'bg-green-500 hover:bg-green-600';
            break;
        // ADDED ADMIN CASE
        case 'ADMIN':
            message = "You are currently in Admin mode. All features are unlocked.";
            buttonText = 'Go to Admin Panel';
            buttonLink = '/admin'; // Future link
            bgColor = 'bg-slate-200 border-slate-300';
            textColor = 'text-slate-800';
            buttonColor = 'bg-slate-600 hover:bg-slate-700';
            break;
        default:
            return null;
    }

    return (
        <div className={`p-4 rounded-xl border text-center ${bgColor} ${textColor}`}>
            <p className="font-semibold">{message}</p>
            {buttonText && buttonLink && (
                <a href={buttonLink} className={`mt-2 inline-block px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-md transition-transform hover:scale-105 ${buttonColor}`}>
                    {buttonText}
                </a>
            )}
        </div>
    );
};

// --- WelcomeHeader with Subscription Badge (No changes needed) ---
const WelcomeHeader = ({ username, profile }: { username: string, profile: UserProfile | null }) => {
    const getBadgeStyle = (status: UserProfile['subscriptionStatus'] | undefined) => {
        switch (status) {
            case 'ADMIN': return 'bg-slate-200 text-slate-800 border-slate-300';
            case 'PREMIUM': return 'bg-green-100 text-green-800 border-green-200';
            case 'TRIAL': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'EXPIRED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div>
            <div className="flex items-center gap-3">
                <h1 className="text-2xl xs:text-3xl md:text-4xl font-bold text-slate-800">
                    Welcome back, {username}!
                </h1>
                {profile && (
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getBadgeStyle(profile.subscriptionStatus)}`}>
                        {profile.subscriptionStatus}
                    </span>
                )}
            </div>
            <p className="mt-1 text-sm xs:text-base text-slate-600">
                Ready to take the next step on your journey?
            </p>
        </div>
    );
};

// --- [FIX] MobileDashboard updated to use the new context structure ---
const MobileDashboard = ({ user, userProfile, isReviewing, showInProgressCard }: { user: User | null, userProfile: UserProfile | null, isReviewing: boolean, showInProgressCard: boolean }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const username = user?.email?.split('@')[0] || 'Aspirant';

    const renderTabContent = () => {
        return (
            <div className="space-y-6">
                <WelcomeHeader username={username} profile={userProfile} />
                <SubscriptionStatusBanner profile={userProfile} />
                
                {activeTab === 'overview' ? (
                     <>
                        <MentorsWisdom />
                        <StudyStreakCalendar />
                     </>
                ) : (
                    <>
                        <RecentEvaluations />
                        <PerformanceGauges />
                    </>
                )}
            </div>
        );
    };
    
    if (isReviewing) return <div className="p-4"><ReviewCard /></div>;
    if (showInProgressCard) return <div className="p-4"><InProgressCard /></div>;

    return (
        <div className="flex flex-col h-full">
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md">
                <MobileSubNav 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab}
                    tabs={['overview', 'performance']}
                />
            </div>
            <div className="flex-grow overflow-y-auto px-4 pb-16 pt-4">
                 {renderTabContent()}
            </div>
        </div>
    );
};

// --- [FIX] DesktopDashboard updated to use the new context structure ---
const DesktopDashboard = ({ user, userProfile, isReviewing, showInProgressCard }: { user: User | null, userProfile: UserProfile | null, isReviewing: boolean, showInProgressCard: boolean }) => {
    const username = user?.email?.split('@')[0] || 'Aspirant';
    return (
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-3 space-y-8">
                    <WelcomeHeader username={username} profile={userProfile} />
                    <SubscriptionStatusBanner profile={userProfile} />
                    
                    {isReviewing ? (
                        <ReviewCard />
                    ) : (
                        <>
                            {showInProgressCard ? <InProgressCard /> : <EvaluateCard />}
                            <PerformanceGauges />
                        </>
                    )}
                </div>
                <div className="lg:col-span-2 space-y-8 lg:sticky lg:top-8">
                    <MentorsWisdom />
                    <StudyStreakCalendar />
                    <RecentEvaluations />
                </div>
            </div>
        </main>
    );
};


// --- Main Page Component ---
export default function DashboardHomePage() {
    // 1. [FIX] Get both user and userProfile from the context
    const { user, userProfile } = useAuthContext();
    const {
        isProcessingInBackground,
        isReviewing,
        processingState,
        setPageLoading,
        setPageTitle,
    } = useEvaluationStore();
    
    useEffect(() => {
        setPageTitle('Dashboard');
        setPageLoading(true);
        const timer = setTimeout(() => setPageLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [setPageLoading, setPageTitle]);

    const showInProgressCard = processingState === 'ocr' || isProcessingInBackground;

    return (
        <>
            <div className="block md:hidden h-full">
                 {/* 2. [FIX] Pass both user and userProfile down as props */}
                <MobileDashboard 
                    user={user}
                    userProfile={userProfile}
                    isReviewing={isReviewing}
                    showInProgressCard={showInProgressCard}
                />
            </div>
            <div className="hidden md:block">
                <DesktopDashboard 
                    user={user}
                    userProfile={userProfile}
                    isReviewing={isReviewing}
                    showInProgressCard={showInProgressCard}
                />
            </div>
        </>
    );
}