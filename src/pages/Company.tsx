import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompanyData {
  Id: number;
  Nombre: string;
  Nit: string;
  TokenConexion: string;
  Logo: string;
  Direccion: string;
  Telefono: string;
  Email: string;
  AmbienteDian: number;
  TotalFacturas: number;
  TotalNotasCredito: number;
  TotalNotasDebito: number;
  TotalDocumentos: number;
  SetTestId: string;
}

const Company = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyData | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        toast({
          title: "Error",
          description: "No se encontró el ID de la empresa",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/Empresa/TraerEmpresa?IdEmpresa=${companyId}`);
        if (!response.ok) {
          throw new Error("Error al cargar los datos de la empresa");
        }

        const data = await response.json();
        if (data.basePresentation) {
          setCompany(data.basePresentation);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de la empresa",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Empresa</h1>
        <p className="text-muted-foreground">Configura la información de tu empresa para la facturación</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>Datos principales de tu empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Empresa *</Label>
                  <Input id="name" value={company?.Nombre || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">NIF/CIF *</Label>
                  <Input id="taxId" value={company?.Nit || ""} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input id="address" value={company?.Direccion || ""} readOnly />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input id="city" placeholder="Madrid" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Código Postal *</Label>
                  <Input id="postalCode" placeholder="28001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País *</Label>
                  <Select defaultValue="es">
                    <SelectTrigger id="country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">España</SelectItem>
                      <SelectItem value="co">Colombia</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>Datos de contacto que aparecerán en las facturas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={company?.Email || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input id="phone" value={company?.Telefono || ""} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input id="website" placeholder="https://www.empresa.com" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Configuración Fiscal</CardTitle>
              <CardDescription>Información específica para cada jurisdicción</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="regime">Régimen Fiscal</Label>
                <Select defaultValue="general">
                  <SelectTrigger id="regime">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Régimen General</SelectItem>
                    <SelectItem value="simplified">Régimen Simplificado</SelectItem>
                    <SelectItem value="exempt">Exento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas Fiscales</Label>
                <Textarea
                  id="notes"
                  placeholder="Información adicional que deseas incluir en tus facturas..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline">Cancelar</Button>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Logo de la Empresa</CardTitle>
              <CardDescription>Aparecerá en tus facturas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted overflow-hidden">
                  {company?.Logo ? (
                    <img src={company.Logo} alt="Logo" className="h-full w-full object-contain" />
                  ) : (
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <Button variant="outline" size="sm">
                  Subir Logo
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  PNG, JPG hasta 2MB
                  <br />
                  Recomendado: 400x400px
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary shadow-lg">
            <CardHeader>
              <CardTitle className="text-base">Certificados Digitales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-sm font-medium">España (Verifactu)</p>
                <p className="text-xs text-muted-foreground">Estado: No configurado</p>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  Configurar →
                </Button>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-sm font-medium">Colombia (DIAN)</p>
                <p className="text-xs text-muted-foreground">
                  Ambiente: {company?.AmbienteDian === 1 ? "Producción" : "Pruebas"}
                </p>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  Configurar →
                </Button>
              </div>
              
              <div className="rounded-lg border bg-card p-3 space-y-1">
                <p className="text-sm font-medium">Estadísticas</p>
                <p className="text-xs text-muted-foreground">Facturas: {company?.TotalFacturas || 0}</p>
                <p className="text-xs text-muted-foreground">Notas Crédito: {company?.TotalNotasCredito || 0}</p>
                <p className="text-xs text-muted-foreground">Notas Débito: {company?.TotalNotasDebito || 0}</p>
                <p className="text-xs text-muted-foreground">Total Documentos: {company?.TotalDocumentos || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Company;
