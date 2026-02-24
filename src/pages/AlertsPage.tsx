import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import AlertsPanel from "@/components/AlertsPanel";

const AlertsPage = () => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <TopBar />
      <main className="flex-1 p-4 overflow-y-auto">
        <AlertsPanel />
      </main>
    </div>
  </div>
);

export default AlertsPage;
