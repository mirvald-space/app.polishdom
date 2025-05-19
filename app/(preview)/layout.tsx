import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import { LMSNavigation } from "@/components/shared/lms-navigation";
import Link from "next/link";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PolishDom - Обучение польскому языку",
  description: "Интерактивная платформа для изучения польского языка",
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">PolishDOM</span>
            <span className="text-sm text-muted-foreground">LMS</span>
          </Link>
          <LMSNavigation />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PolishDOM LMS. Все права защищены.
          </p>
          <div className="flex items-center space-x-1">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              О проекте
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Контакты
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Помощь
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
