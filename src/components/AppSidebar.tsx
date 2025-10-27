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
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.dashboard")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="bg-accent hover:bg-accent-hover" data-tour="new-invoice">
                  <NavLink to="/invoices/new">
                    <PlusCircle className="h-4 w-4" />
                    <span className="font-medium">{t("nav.newInvoice")}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("common.search")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      data-tour={
                        index === 0 ? "dashboard" :
                        index === 1 ? "invoices" :
                        index === 2 ? "clients" :
                        index === 3 ? "products" :
                        index === 4 ? "company" :
                        index === 5 ? "settings" :
                        undefined
                      }
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-medium"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
