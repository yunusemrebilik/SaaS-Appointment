import * as React from 'react';

export default function OnboardingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="w-full max-w-md">{children}</div>
        </div>
    );
}
