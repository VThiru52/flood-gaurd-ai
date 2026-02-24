import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MapPage from "./pages/MapPage";
import AlertsPage from "./pages/AlertsPage";
import WeatherPage from "./pages/WeatherPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DataSourcesPage from "./pages/DataSourcesPage";
import ReportsPage from "./pages/ReportsPage";
import AIModelsPage from "./pages/AIModelsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/data-sources" element={<DataSourcesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/ai-models" element={<AIModelsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
