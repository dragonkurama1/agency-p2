import {
  Code2, TrendingUp, Megaphone, Share2, Camera, Sparkles, Workflow, Compass,
  LayoutGrid, BarChart3, type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Code2, TrendingUp, Megaphone, Share2, Camera, Sparkles, Workflow, Compass, LayoutGrid, BarChart3,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Sparkles;
}
