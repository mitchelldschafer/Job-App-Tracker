interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
            <main className="container mx-auto p-4 md:p-8 h-screen flex flex-col">
                {children}
            </main>
        </div>
    );
}
