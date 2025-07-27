import type { Metadata } from "next";

import "./globals.css";

import { kalam, rm, ibmm, rs, la } from "@/fonts/custom_fonts";



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
      </body>
    </html>
  );
}
