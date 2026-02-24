import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import MapView from "@/components/MapView";

const MapPage = () => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <TopBar />
      <main className="flex-1 p-4 overflow-y-auto">
        <MapView />
      </main>
    </div>
  </div>
);

export default MapPage;
