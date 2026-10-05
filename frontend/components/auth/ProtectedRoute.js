"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

// Client-side route guard: redirects unauthenticated users to /login and
// users with the wrong role to their own dashboard. Wraps any protected
// page: <ProtectedRoute allow={["CANDIDATE"]}>...</ProtectedRoute>
export default function ProtectedRoute({ allow, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allow && !allow.includes(user.role)) {
      router.replace("/");
    }
  }, [user, loading, allow, router]);

  if (loading || !user || (allow && !allow.includes(user.role))) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
      </div>
    );
  }

  return children;
}
