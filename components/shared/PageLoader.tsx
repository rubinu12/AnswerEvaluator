'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export default function PageLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        NProgress.configure({ showSpinner: false }); // We don't need the default spinner

        const handleStart = () => NProgress.start();
        const handleStop = () => NProgress.done();

        // For every new page load, we want to stop the progress bar
        handleStop();

        return () => {
            // This cleanup is not strictly necessary with the new App Router,
            // but it's good practice.
            handleStop();
        };
    }, [pathname, searchParams]);

    // Although the logic runs in useEffect, this component needs to return null 
    // as it doesn't render any visible JSX itself.
    return null;
}