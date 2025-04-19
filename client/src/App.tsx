import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CoachListing from "@/pages/CoachListing";
import CoachDetail from "@/pages/CoachDetail";
import ScrollToTop from "@/components/ScrollToTop";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  return (
    <ScrollArea className="h-screen w-full">
      <Header />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/coaches" component={CoachListing} />
          <Route path="/coach/:id" component={CoachDetail} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <ScrollToTop />
    </ScrollArea>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
