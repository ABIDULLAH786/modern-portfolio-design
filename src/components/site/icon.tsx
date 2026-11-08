import {
  ChartBar, Bug, Boxes, Box, Brush, Cloud, Code, CodeXml, Cpu, Film, Gamepad2, Globe, Headphones, Image as ImageIcon,
  Joystick, Layers, Lightbulb, Megaphone, Monitor, Music, Palette, PenTool, Puzzle, Rocket, RotateCw, Settings, Shield,
  Smartphone, Sparkles, Store, Swords, Tablet, Target, TrendingUp, Trophy, Users, WandSparkles, Wifi, Wrench, Zap,
  type LucideIcon,
} from "lucide-react";
import type { ServiceIcon } from "@/lib/constants";

/** Allowlisted lucide icons (Services). Only these are bundled. */
export const ICONS: Record<ServiceIcon, LucideIcon> = {
  "gamepad-2": Gamepad2, joystick: Joystick, smartphone: Smartphone, tablet: Tablet, monitor: Monitor, code: Code,
  "code-xml": CodeXml, box: Box, boxes: Boxes, sparkles: Sparkles, rocket: Rocket, palette: Palette, brush: Brush,
  layers: Layers, cpu: Cpu, trophy: Trophy, "wand-sparkles": WandSparkles, zap: Zap, globe: Globe, bug: Bug,
  "rotate-cw": RotateCw, store: Store, megaphone: Megaphone, puzzle: Puzzle, swords: Swords, target: Target, users: Users,
  cloud: Cloud, wifi: Wifi, shield: Shield, "trending-up": TrendingUp, "chart-bar": ChartBar, "pen-tool": PenTool,
  image: ImageIcon, film: Film, music: Music, headphones: Headphones, lightbulb: Lightbulb, settings: Settings, wrench: Wrench,
};

export function ServiceIconView({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name as ServiceIcon] ?? Sparkles;
  return <Cmp className={className} aria-hidden="true" />;
}
