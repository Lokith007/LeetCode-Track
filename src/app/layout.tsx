import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ApolloWrapper from './components/ApolloWrapper';
import { AuthProvider } from './components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LeetCode Tracker',
  description: 'Track your college batches LeetCode progress',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ApolloWrapper>{children}</ApolloWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
