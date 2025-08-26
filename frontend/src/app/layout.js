// Ensure this path is correct relative to app/layout.js
import "./globals.css";
import ChatbotOverlay from "@/components/ChatBox";

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
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="font-sans text-gray-800 bg-white">
        {children}
        <ChatbotOverlay />
      </body>
    </html>
  );
}
