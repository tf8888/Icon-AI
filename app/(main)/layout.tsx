'use client';

import { AppSidebar } from '@/components/app-sidebar';

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-background flex">
            <AppSidebar />
            <main className="flex-1 flex flex-col">{children}</main>
        </div>
    );
}
