import { Header } from "@/components/layout/Header";
import {Footer} from "@/components/layout/Footer";

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
