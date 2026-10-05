import { cn } from "@/lib/utils";

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-6 transition-transform duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
