import {
  Kalam,
  Space_Grotesk,
  Roboto_Mono,
  IBM_Plex_Mono,
  Lato,
  Orbitron,
} from "next/font/google";

export const kalam = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  variable: "--font-kalam",
  subsets: ["latin"],
  style: ["normal"],
});

export const ibmm = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibmm",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const rm = Roboto_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-rm",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const rs = Orbitron({
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-rs",
  subsets: ["latin"],
  style: ["normal"],
});

export const la = Lato({
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-la",
  subsets: ["latin"],
  style: ["normal", "italic"],
});
