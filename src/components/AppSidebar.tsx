import { useState } from "react";
import { 
  LayoutDashboard, Map, AlertTriangle, CloudRain, 
  Database, Droplets, Shield, Menu, X,
  BarChart3, FileText
} from "lucide-react";

const navItems = [
  { icon: <LayoutDashboard size={18} />, label: "Dashboard", active: true },
  { icon: <Map size={18} />, label: "Map View" },
  { icon: <AlertTriangle size={18} />, label: "Alerts" },
  { icon: <CloudRain size={18} />, label: "Weather" },
  { icon: <BarChart3 size={18} />, label: "Analytics" },
  { icon: <Database size={18} />, label: "Data Sources" },
  { icon: <FileText size={18} />, label: "Reports" },
  { icon: <Shield size={18} />, label: "AI Models" },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0 z-50 transition-all duration-300"
      style={{ width: collapsed ? 64 : 220 }}
    >
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-primary flex-shrink-0">
          <Droplets size={18} className="text-primary" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>FLOOD GUARD</h1>
            <p className="text-[9px] text-muted-foreground tracking-widest">AI MONITORING</p>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              item.active 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            {item.icon}
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success flood-pulse" />
          {!collapsed && (
            <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>SYSTEM ONLINE</span>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
