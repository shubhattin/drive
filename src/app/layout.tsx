import './globals.css';
import './app.scss';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { Metadata } from 'next';
import TRPCProvider from '~/api/TRPCProvider';

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark" style={{ colorScheme: 'dark' }}>
      <body className={cn('antialiased', 'overflow-y-scroll sm:px-2 lg:px-3 xl:px-4 2xl:px-4')}>
        <ThemeProvider
          attribute={['class']}
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCProvider>
            <div className="container mx-auto mb-1">
              <Toaster richColors={true} />
              {children}
            </div>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// export const runtime = 'edge';

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico'
  }
};
