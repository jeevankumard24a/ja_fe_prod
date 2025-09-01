import type { Metadata } from "next";

import "./globals.css";

import { kalam, rm, ibmm, rs, la } from "@/fonts/custom_fonts";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
    title: "JALGO.AI",
    description: "Learn & Grow. Network & Connect. Get Hired.",
    icons: {
        icon: "/favicon.ico",
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
          className={`h-full ${ibmm.variable}  ${rm.variable} ${rs.variable}  ${la.variable}  ${kalam.variable}   antialiased`}
      >
        {children}
        <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
      </body>
    </html>
  );
}
