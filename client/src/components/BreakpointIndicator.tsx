import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export function BreakpointIndicator() {
  const [breakpoint, setBreakpoint] = useState("default");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    function updateBreakpoint() {
      const width = window.innerWidth;
      if (width >= 1536) return setBreakpoint("2xl");
      if (width >= 1280) return setBreakpoint("xl");
      if (width >= 1024) return setBreakpoint("lg");
      if (width >= 768) return setBreakpoint("md");
      if (width >= 640) return setBreakpoint("sm");
      return setBreakpoint("xs");
    }

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  if (!isVisible || process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      <Badge 
        variant="outline" 
        className="bg-background/80 backdrop-blur-sm border-2 cursor-pointer"
        onClick={() => setIsVisible(false)}
      >
        Breakpoint: {breakpoint} ({window.innerWidth}px)
      </Badge>
    </div>
  );
}
