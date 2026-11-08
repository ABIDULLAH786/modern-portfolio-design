import {
  ChartBar, Briefcase, Database, Gamepad2, Images, Inbox, LayoutDashboard, LayoutList, Palette, Quote, Search, Sparkles, User, UserCog,
  type LucideIcon,
} from "lucide-react";

export const NAV: Array<{ href: string; label: string; icon: LucideIcon; badge?: "unread" }> = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/theme", label: "Theme", icon: Palette },
  { href: "/admin/profile", label: "Profile", icon: User },
  { href: "/admin/games", label: "Games", icon: Gamepad2 },
  { href: "/admin/skills", label: "Skills", icon: ChartBar },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/services", label: "Services", icon: Sparkles },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/layout-sections", label: "Layout", icon: LayoutList },
  { href: "/admin/messages", label: "Messages", icon: Inbox, badge: "unread" },
  { href: "/admin/media", label: "Media", icon: Images },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/backup", label: "Backup", icon: Database },
  { href: "/admin/account", label: "Account", icon: UserCog },
];
