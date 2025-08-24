import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ApolloWrapper from './components/ApolloWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Competitive Programming Tracker',
  description: 'Track your college batches competitive programming progress across multiple platforms',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
