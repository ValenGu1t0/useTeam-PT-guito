import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ReactQueryClientProvider } from "@/providers/ReactQueryClientProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from 'sonner';
import { cn } from "@/lib/utils";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Kanban",
  description: "Prueba Técnica useTeam",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn(
        `${roboto.variable} antialiased`,
        "min-h-screen bg-background font-sans"
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryClientProvider>
              {children}
              <Toaster richColors />
          </ReactQueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}