import { DM_Sans, Inter, Orbitron, Outfit, Rajdhani, Sora, Space_Grotesk } from "next/font/google";

/*
 * All 4 pairs are declared with preload:false. The `.variable` classes only define CSS
 * custom properties, so a family is only downloaded when --font-head / --font-body
 * actually point at it (see DECISIONS.md).
 */
const sora = Sora({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-sora", display: "swap", preload: false });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter", display: "swap", preload: false });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-space-grotesk", display: "swap", preload: false });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-dm-sans", display: "swap", preload: false });
const orbitron = Orbitron({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-orbitron", display: "swap", preload: false });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-rajdhani", display: "swap", preload: false });
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "800"], variable: "--font-outfit", display: "swap", preload: false });

export const fontVariableClasses = [sora, inter, spaceGrotesk, dmSans, orbitron, rajdhani, outfit]
  .map((f) => f.variable)
  .join(" ");
