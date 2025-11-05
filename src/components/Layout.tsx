import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, LogOut, User, Languages, Sparkles, X, Building2, Settings, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getApiUrl } from "@/lib/api";
import { format, startOfMonth } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  const [forceStartTour, setForceStartTour] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const [companyName, setCompanyName] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [monthlyInvoicesCount, setMonthlyInvoicesCount] = useState(0);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Event listener for restarting the tour
  useEffect(() => {
    const handleRestartTour = () => {
      setForceStartTour(true);
      setShowOnboarding(true);
    };

    window.addEventListener('restart-tour', handleRestartTour);
    return () => window.removeEventListener('restart-tour', handleRestartTour);
  }, []);

  useEffect(() => {
    // Load company name from localStorage
    const storedCompanyName = localStorage.getItem("companyName");
    if (storedCompanyName) {
      setCompanyName(storedCompanyName);
    }
  }, []);

  // Fetch monthly invoices count
  useEffect(() => {
    const fetchMonthlyInvoices = async () => {
      const companyId = localStorage.getItem("companyId");
      const authToken = localStorage.getItem("authToken");

      if (!companyId || !authToken) {
        return;
      }

      setLoadingInvoices(true);
      try {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const fechaInicial = format(monthStart, 'yyyy-MM-dd');
        const fechaFinal = format(now, 'yyyy-MM-dd');

        const response = await fetch(
          getApiUrl(`/Documento/TraerDatosDocumentosPeriodo?IdEmpresa=${companyId}&FechaInicial=${fechaInicial}&FechaFinal=${fechaFinal}`),
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.codResponse === 1 && data.basePresentationList) {
            setMonthlyInvoicesCount(data.basePresentationList.length);
          }
        }
      } catch (error) {
        console.error("Error fetching monthly invoices:", error);
      } finally {
        setLoadingInvoices(false);
      }
    };

    fetchMonthlyInvoices();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchMonthlyInvoices, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    // Clear all auth data from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("companyId");
    localStorage.removeItem("companyName");
    localStorage.removeItem("companyNit");
    
    toast({
      title: t("auth.sessionClosed"),
      description: t("auth.sessionClosedDesc"),
    });
    
    navigate("/auth");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const toggleTheme = () => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const dismissUpgradeBanner = () => {
    const userName = localStorage.getItem("userName");
    if (userName) {
      localStorage.setItem(`upgrade_banner_dismissed_${userName}`, "true");
      setShowUpgradeBanner(false);
    }
  };

  const getPlanLimit = (plan: string): number => {
    const limits: Record<string, number> = {
      "Gratis": 10,
      "Básico": 50,
      "PRO": 200,
      "Empresarial": 1000,
    };
    return limits[plan] || 10;
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
                    {t("common.upgradeMessage")}
                  </span>
                  <span className="text-sm text-muted-foreground hidden md:inline">
                    {t("common.upgradeDescription")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate("/settings?tab=subscription")}
                    className="gap-2 h-8"
                  >
                    <Sparkles className="h-3 w-3" />
                    {t("common.viewPlans")}
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
            <img src={ebillLogo} alt="eBill Pro" className="h-12 w-auto" />
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-semibold">
                {planName}
              </Badge>
              {!loadingInvoices && (
                <div className="flex flex-col gap-1 min-w-[180px]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Documentos del mes</span>
                    <span className="font-medium">
                      {monthlyInvoicesCount} / {getPlanLimit(planName)}
                    </span>
                  </div>
                  <Progress 
                    value={(monthlyInvoicesCount / getPlanLimit(planName)) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </div>
            <div className="flex-1" />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="mr-2"
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background w-56">
                {companyName && (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col space-y-1">
                          <p className="text-xs text-muted-foreground">Empresa</p>
                          <p className="text-sm font-medium leading-none">{companyName}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/company")}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Mi Empresa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 overflow-auto bg-muted/30 p-6">{children}</main>
        </div>
        <OnboardingTour 
          forceStart={forceStartTour} 
          onComplete={() => {
            setShowOnboarding(false);
            setForceStartTour(false);
          }} 
        />
      </div>
    </SidebarProvider>
  );
}
