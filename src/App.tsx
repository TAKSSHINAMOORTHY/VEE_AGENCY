import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Business from "./pages/Business";
import BusinessCompanyDetail from "./pages/BusinessCompanyDetail";
import BillDetail from "./pages/BillDetail";
import Personal from "./pages/Personal";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Ledger from "./pages/Ledger";
import Companies from "./pages/Companies";
import NotFound from "./pages/NotFound";
import { AppLockGate } from "@/security/AppLockGate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLockGate>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/business" element={<Business />} />
            <Route path="/business/company/:companyId" element={<BusinessCompanyDetail />} />
            <Route path="/business/company/:companyId/bill/:billId" element={<BillDetail />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/personal" element={<Personal />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLockGate>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
