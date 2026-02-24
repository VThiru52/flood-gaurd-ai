import { Bell, Search, User, CloudRain } from "lucide-react";

const TopBar = () => (
  <header className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-card/30 backdrop-blur-lg sticky top-0 z-40">
    <div>
      <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        AI Flood Guard — <span className="text-gradient-primary">Vijayawada PoC</span>
      </h2>
      <p className="text-xs text-muted-foreground">
        Andhra Pradesh · Stormwater Network Monitoring · Real-time
      </p>
    </div>

    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20">
        <CloudRain size={14} className="text-warning" />
        <span className="text-xs font-semibold text-warning" style={{ fontFamily: "'JetBrains Mono', monospace" }}>HEAVY RAIN</span>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search wards, drains..."
          className="pl-9 pr-4 py-2 text-xs rounded-lg bg-secondary border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-48"
        />
      </div>

      <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
        <Bell size={16} className="text-muted-foreground" />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-destructive text-[8px] text-destructive-foreground flex items-center justify-center font-bold">3</span>
      </button>

      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
        <User size={16} className="text-primary" />
      </div>
    </div>
  </header>
);

export default TopBar;
