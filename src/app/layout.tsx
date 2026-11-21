import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { type Metadata } from "next";
import { Poppins } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import Header from "@/components/ui/header";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
import "@schedule-x/theme-shadcn/dist/index.css";
import Footer from "@/components/screen/footer/footer";
import { Toaster } from "@/components/ui/sonner";
import { Loader } from "lucide-react";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.revetalhagen.no"),
  title: {
    default: "Revetalhagen",
    template: "%s | Revetalhagen",
  },
  description:
    "Revetalhagen er et åpent, livssynsnøytralt og inkluderende møtested i Revetal med skolehage, dyrking, selskapslokale, overnatting og arrangementer for alle aldre.",
  icons: [{ rel: "icon", url: "/images/nakuhel-logo.webp" }],
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: "https://www.revetalhagen.no",
    siteName: "Revetalhagen",
    title: "Revetalhagen",
    description:
      "Revetalhagen er et åpent, livssynsnøytralt og inkluderende møtested i Revetal med skolehage, dyrking, selskapslokale, overnatting og arrangementer for alle aldre.",
    images: [
      {
        url: "/images/laahnehuset.jpg",
        width: 1200,
        height: 630,
        alt: "Revetalhagen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nb" className={`${poppins.variable} min-h-screen max-w-screen`}>
      <body>
        <Analytics />
        <NuqsAdapter>
          <TRPCReactProvider>
            <Header />
            <div className="min-h-screen">
              <Suspense
                fallback={
                  <div className="flex h-[100vh] w-full items-center justify-center">
                    <Loader className="animate-spin" />
                  </div>
                }
              >
                {children}
              </Suspense>
            </div>
            <Footer className="mt-20" />
            <Toaster position="top-center" />
          </TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
