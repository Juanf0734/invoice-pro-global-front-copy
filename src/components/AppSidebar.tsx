import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Building2,
  Settings,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { t } = useTranslation();

  const handleRestartTour = () => {
    window.dispatchEvent(new Event('restart-tour'));
  };

  const menuItems = [
    { title: t("nav.dashboard"), url: "/", icon: LayoutDashboard },
    { title: t("nav.invoices"), url: "/invoices", icon: FileText },
    { title: t("nav.clients"), url: "/clients", icon: Users },
    { title: t("nav.products"), url: "/products", icon: Package },
    { title: t("nav.company"), url: "/company", icon: Building2 },
    { title: t("nav.settings"), url: "/settings", icon: Settings },
  ];
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Nueva Factura - Acción destacada */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="bg-accent hover:bg-accent-hover h-11" data-tour="new-invoice">
                  <NavLink to="/invoices/new">
                    <PlusCircle className="h-5 w-5" />
                    <span className="font-medium text-base">{t("nav.newInvoice")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operaciones principales */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">Operaciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11">
                  <NavLink
                    to="/"
                    end
                    data-tour="dashboard"
                    className={({ isActive }) =>
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary font-medium"
                        : "hover:bg-sidebar-accent/50"
                    }
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="text-base">{t("nav.dashboard")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11">
                  <NavLink
                    to="/invoices"
                    data-tour="invoices"
                    className={({ isActive }) =>
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary font-medium"
                        : "hover:bg-sidebar-accent/50"
                    }
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-base">{t("nav.invoices")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gestión de datos */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11">
                  <NavLink
                    to="/clients"
                    data-tour="clients"
                    className={({ isActive }) =>
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary font-medium"
                        : "hover:bg-sidebar-accent/50"
                    }
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-base">{t("nav.clients")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11">
                  <NavLink
                    to="/products"
                    data-tour="products"
                    className={({ isActive }) =>
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary font-medium"
                        : "hover:bg-sidebar-accent/50"
                    }
                  >
                    <Package className="h-5 w-5" />
                    <span className="text-base">{t("nav.products")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configuración - Al final */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-sm">Ajustes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleRestartTour}
                  className="h-11 hover:bg-sidebar-accent/50 cursor-pointer"
                >
                  <HelpCircle className="h-5 w-5" />
                  <span className="text-base">Tour de la plataforma</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11">
                  <NavLink
                    to="/company"
                    data-tour="company"
                    className={({ isActive }) =>
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary font-medium"
                        : "hover:bg-sidebar-accent/50"
                    }
                  >
                    <Building2 className="h-5 w-5" />
                    <span className="text-base">{t("nav.company")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11">
                  <NavLink
                    to="/settings"
                    data-tour="settings"
                    className={({ isActive }) =>
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary font-medium"
                        : "hover:bg-sidebar-accent/50"
                    }
                  >
                    <Settings className="h-5 w-5" />
                    <span className="text-base">{t("nav.settings")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
