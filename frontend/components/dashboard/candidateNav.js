import {
  LayoutDashboard,
  UserCircle,
  FileText,
  Search,
  ClipboardList,
  ClipboardCheck,
  MessagesSquare,
  Target,
  Bell,
  Settings,
} from "lucide-react";

export const candidateNav = [
  { label: "Overview", href: "/candidate/dashboard", icon: LayoutDashboard },
  { label: "My Profile", href: "/candidate/profile", icon: UserCircle },
  { label: "Resume Intelligence", href: "/candidate/resume", icon: FileText },
  { label: "Find Jobs", href: "/candidate/jobs", icon: Search },
  { label: "Applications", href: "/candidate/applications", icon: ClipboardList },
  { label: "Assessments", href: "/candidate/assessments", icon: ClipboardCheck },
  { label: "AI Interview", href: "/candidate/interview", icon: MessagesSquare },
    { label: "Skill Gap", href: "/candidate/skill-gap", icon: Target },
  { label: "Notifications", href: "/candidate/notifications", icon: Bell },
    { label: "Settings", href: "/candidate/settings", icon: Settings },
];
