// Ensure this path is correct relative to app/layout.js
import "./globals.css";

export const metadata = {
  title: "Roots & Wings - Find the Right Mentor for Your Journey",
  description:
    "Explore deeply rooted skills and knowledge from experienced UK-based mentors",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <script src="https://cdn.tailwindcss.com"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            primary: '#00A2E8',
                            'primary-dark': '#00468C',
                            'primary-light': '#f8fbff',
                            'accent-light': '#e8f4ff'
                        },
                        fontFamily: {
                            sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
                        }
                    }
                }
            }
          `,
        }}
      ></script>

      <head>
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-gray-800 bg-white">{children}</body>
    </html>
  );
}
