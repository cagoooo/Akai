import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get the theme from localStorage first
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) return saved;
    // If no saved preference, use system theme
    return "system";
  });

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    // Watch for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    // Apply theme changes with transition
    const root = window.document.documentElement;
    const effectiveTheme = theme === "system" ? systemTheme : theme;

    // Add no-transition class to prevent flickering
    root.classList.add("no-theme-transition");

    // Remove old theme classes
    root.classList.remove("light", "dark");

    // Add new theme class
    root.classList.add(effectiveTheme);

    // Store the preference
    localStorage.setItem("theme", theme);

    // Remove no-transition class after a short delay
    requestAnimationFrame(() => {
      root.classList.remove("no-theme-transition");
    });
  }, [theme, systemTheme]);

  const iconVariants = {
    initial: { opacity: 0, rotate: -30 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 30 }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative w-10 h-10"
          aria-label="切換主題"
        >
          <AnimatePresence mode="wait">
            {(theme === "dark" || (theme === "system" && systemTheme === "dark")) && (
              <motion.div
                key="dark"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={iconVariants}
                className="absolute"
              >
                <Moon className="h-5 w-5" />
              </motion.div>
            )}
            {(theme === "light" || (theme === "system" && systemTheme === "light")) && (
              <motion.div
                key="light"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={iconVariants}
                className="absolute"
              >
                <Sun className="h-5 w-5" />
              </motion.div>
            )}
            {theme === "system" && (
              <motion.div
                key="system"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={iconVariants}
                className="absolute opacity-25"
              >
                <Laptop className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>淺色</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>深色</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Laptop className="mr-2 h-4 w-4" />
          <span>系統</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}