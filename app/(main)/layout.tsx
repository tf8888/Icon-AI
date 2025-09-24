'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { AppSidebar } from '@/components/app-sidebar';
import Header from '@/components/header';
import { ProfileProvider } from '@/lib/contexts/ProfileContext';

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.replace('/sign-in');
        }
    }, [isLoaded, isSignedIn, router]);

    return (
        <ProfileProvider>
            <div className="min-h-screen bg-background flex">
                <AppSidebar />
                <div className="flex-1 flex flex-col h-screen overflow-auto">
                    <Header />
                    <main className="flex-1 flex flex-col">{children}</main>
                </div>
            </div>
        </ProfileProvider>
    );
}
