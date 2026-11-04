import { Cormorant_Garamond, Dancing_Script, Lora } from "next/font/google";

// Vintage pairing: Cormorant for headings and buttons, Lora for everything read.
const display = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["500", "600"] });
const body = Lora({ variable: "--font-lora", subsets: ["latin"], weight: ["400"] });
// The script of the logo, for the hero headline only.
const script = Dancing_Script({ variable: "--font-dancing", subsets: ["latin"], weight: ["600"] });

export const fontClasses = `${display.variable} ${body.variable} ${script.variable}`;
