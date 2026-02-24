import { Palette } from "lucide-react";
import { useTheme, themeOptions, ThemeKey } from "@/hooks/useTheme";

const ThemeSwitcher = ({ collapsed }: { collapsed: boolean }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-2">
      {!collapsed && (
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
          <Palette size={10} /> Theme
        </p>
      )}
      <div className={collapsed ? "space-y-1.5" : "grid grid-cols-2 gap-1.5"}>
        {themeOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setTheme(opt.key)}
            className={`flex items-center gap-2 rounded-lg p-1.5 transition-all text-left ${
              theme === opt.key
                ? "ring-2 ring-primary bg-primary/10"
                : "hover:bg-secondary/50"
            }`}
            title={opt.label}
          >
            <div
              className="w-5 h-5 rounded-md border border-border/50 shrink-0"
              style={{ background: opt.preview }}
            />
            {!collapsed && (
              <span className="text-[10px] text-foreground leading-tight truncate">
                {opt.label}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
