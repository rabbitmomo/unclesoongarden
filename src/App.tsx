import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import Home from "./pages/Home";
import Plants from "./pages/Plants";
import PlantDetail from "./pages/PlantDetail";
import DailyCheck from "./pages/DailyCheck";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import PostDetail from "./pages/PostDetail";
import FarmerProfile from "./pages/FarmerProfile";
import CreatePost from "./pages/CreatePost";
import IdentifyCamera from "./pages/IdentifyCamera";
import IdentifyResults from "./pages/IdentifyResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/post/:id" element={<PostDetail />} />
          <Route path="/explore/farmer/:id" element={<FarmerProfile />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/identify" element={<IdentifyCamera />} />
          <Route path="/identify-results" element={<IdentifyResults />} />
          <Route path="/check" element={<DailyCheck />} />
          <Route path="/plants" element={<Plants />} />
          <Route path="/plants/:id" element={<PlantDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
