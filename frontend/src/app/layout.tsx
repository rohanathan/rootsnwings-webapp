import '@/styles/globals.css';
import Link from 'next/link';

export const metadata = { title: 'Roots & Wings' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <nav className="bg-blue-600 text-white p-4">
          <ul className="container mx-auto flex gap-4">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/mentors">Mentors</Link></li>
          </ul>
        </nav>
        <main className="flex-grow container mx-auto p-4">
          {children}
        </main>
        <footer className="bg-gray-100 text-center p-4">
          © {new Date().getFullYear()} Roots & Wings
        </footer>
      </body>
    </html>
  );
}
