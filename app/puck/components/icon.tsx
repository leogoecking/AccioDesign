import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Database,
  DollarSign,
  Download,
  FileText,
  Filter,
  Folder,
  Globe,
  Home,
  Inbox,
  Layers,
  LayoutDashboard,
  Lock,
  Mail,
  MoveRight,
  Package,
  PieChart,
  Plus,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP = {
  activity: Activity,
  "alert-circle": AlertCircle,
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
  "bar-chart-3": BarChart3,
  bell: Bell,
  "building-2": Building2,
  calendar: Calendar,
  check: Check,
  "check-circle-2": CheckCircle2,
  clock: Clock,
  "credit-card": CreditCard,
  database: Database,
  "dollar-sign": DollarSign,
  download: Download,
  "file-text": FileText,
  filter: Filter,
  folder: Folder,
  globe: Globe,
  home: Home,
  inbox: Inbox,
  layers: Layers,
  "layout-dashboard": LayoutDashboard,
  lock: Lock,
  mail: Mail,
  "move-right": MoveRight,
  package: Package,
  "pie-chart": PieChart,
  plus: Plus,
  search: Search,
  settings: Settings,
  shield: Shield,
  "shopping-cart": ShoppingCart,
  sparkles: Sparkles,
  "trending-up": TrendingUp,
  user: User,
  users: Users,
  zap: Zap,
} satisfies Record<string, LucideIcon>;

export type IconName = "none" | keyof typeof ICON_MAP;

export const ICON_OPTIONS: { label: string; value: IconName }[] = [
  { label: "Nenhum", value: "none" },
  ...Object.keys(ICON_MAP).map((name) => ({
    label: name,
    value: name as keyof typeof ICON_MAP,
  })),
];

export function PuckIcon({
  name,
  className = "size-4",
}: {
  name?: IconName;
  className?: string;
}) {
  if (!name || name === "none") {
    return null;
  }

  const IconComponent = ICON_MAP[name];
  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={className} aria-hidden="true" />;
}
