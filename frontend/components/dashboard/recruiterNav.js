import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  ClipboardCheck,
  MessagesSquare,
  Gauge,
  BarChart3,
  Bell,
  Settings,
} from "lucide-react";

export const recruiterNav = [
  { label: "Overview", href: "/recruiter/dashboard", icon: LayoutDashboard },
  { label: "Company", href: "/recruiter/company", icon: Building2 },
  { label: "Jobs", href: "/recruiter/jobs", icon: Briefcase },
  { label: "Applicants", href: "/recruiter/applicants", icon: Users },
  { label: "Assessments", href: "/recruiter/jobs", icon: ClipboardCheck },
  { label: "Interviews", href: "/recruiter/applicants", icon: MessagesSquare },
  { label: "Candidate Intelligence", href: "/recruiter/applicants", icon: Gauge },
  { label: "Analytics", href: "/recruiter/analytics", icon: BarChart3 },
  { label: "Notifications", href: "/recruiter/notifications", icon: Bell },
    { label: "Settings", href: "/recruiter/settings", icon: Settings },
];
