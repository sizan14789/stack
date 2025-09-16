import { cookies } from "next/headers";
import "./globals.css";
import AppProvider from "@/context/AppContext";
import Header from "@/ui/header/Header";
import Footer from "@/ui/footer/Footer";
import { Toaster } from "react-hot-toast";
import { Poppins } from 'next/font/google'

export const metadata = {
  title: "Stack",
  description: "A real time chat project",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "400", "500", "700", "900"],
})

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;

  return (
    <html lang="en">
      <AppProvider>
        <body
          className={`${poppins.className} flex flex-col min-h-svh min-w-svw ${
            theme === "dark" ? "dark" : "light"
          } duration-150 ease-in-out`}
        >
          <Toaster />
          <Header />
          {children}
          <Footer />
        </body>
      </AppProvider>
    </html>
  );
}
