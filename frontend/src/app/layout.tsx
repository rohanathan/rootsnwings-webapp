/*
================================================================================
File: src/app/layout.tsx (Your Updated Main Layout)
================================================================================
This file now includes the ThemeRegistry to enable Material-UI across your app,
while keeping your existing navigation and footer structure.
*/
import type { Metadata } from "next";
import Link from 'next/link';
import ThemeRegistry from '@/components/ThemeRegistry'; // We will create this

export const metadata: Metadata = {
  title: "Roots & Wings",
  description: "Mentorship Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* ThemeRegistry wraps everything to provide MUI theme and CSS baseline */}
        <ThemeRegistry>
          <div className="min-h-screen flex flex-col">
            {/* Updated bg-blue-700 to match the new primary theme color */}
            <nav className="bg-blue-700 text-white p-4 shadow-md">
              <ul className="container mx-auto flex items-center gap-6">
                <li><Link href="/" className="font-bold text-lg">Roots & Wings</Link></li>
                <li className="flex-grow"></li> {/* This pushes the other links to the right */}
                <li><Link href="/dashboard" className="hover:underline">Dashboard</Link></li>
                <li><Link href="/mentors" className="hover:underline">Find a Mentor</Link></li>
                <li>
                  {/* We will make this a modal trigger later */}
                  <Link href="/login" className="bg-white text-blue-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-100 transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </nav>

            <main className="flex-grow container mx-auto p-4">
              {children}
            </main>

            <footer className="bg-gray-100 text-center p-4 mt-8">
              © {new Date().getFullYear()} Roots & Wings
            </footer>
          </div>
        </ThemeRegistry>
      </body>
    </html>
  );
}
