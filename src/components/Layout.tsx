import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, LogOut, User, Languages, Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ebillLogo from "@/assets/ebill-logo.png";
import { OnboardingTour } from "./OnboardingTour";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { planName, subscribed } = useSubscription();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);

  useEffect(() => {
    // Check if user should see onboarding on mount
    const checkOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const hasSeenOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`);
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
        
        // Check if user dismissed upgrade banner
        const dismissedBanner = localStorage.getItem(`upgrade_banner_dismissed_${user.id}`);
        setShowUpgradeBanner(!dismissedBanner);
      }
    };
    checkOnboarding();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: t("common.error"),
        description: t("auth.signOutError"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("auth.sessionClosed"),
        description: t("auth.sessionClosedDesc"),
      });
      navigate("/auth");
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const dismissUpgradeBanner = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem(`upgrade_banner_dismissed_${user.id}`, "true");
      setShowUpgradeBanner(false);
    }
  };

  const shouldShowBanner = planName === "Gratis" && !subscribed && showUpgradeBanner;
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          {/* Upgrade Banner */}
          {shouldShowBanner && (
            <Alert className="rounded-none border-x-0 border-t-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertDescription className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium text-sm">
                    Estás usando el plan gratuito.
                  </span>
                  <span className="text-sm text-muted-foreground hidden md:inline">
                    Actualiza para desbloquear más facturas, usuarios y funciones premium.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate("/settings?tab=subscription")}
                    className="gap-2 h-8"
                  >
                    <Sparkles className="h-3 w-3" />
                    Ver Planes
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={dismissUpgradeBanner}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger />
            <img src={ebillLogo} alt="eBill Pro" className="h-8 w-auto" />
            <Badge variant="secondary" className="ml-2 font-semibold">
              {planName}
            </Badge>
            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-tour="language">
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background">
                <DropdownMenuItem onClick={() => changeLanguage("es")}>
                  {t("common.spanish")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("en")}>
                  {t("common.english")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                3
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 overflow-auto bg-muted/30 p-6">{children}</main>
        </div>
        {showOnboarding && <OnboardingTour />}
      </div>
    </SidebarProvider>
  );
}
