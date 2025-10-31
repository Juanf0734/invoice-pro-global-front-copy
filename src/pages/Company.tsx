import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api";
import { useTranslation } from "react-i18next";

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

interface ParametrosEmpresa {
  IdEmpresa?: number;
  IdCliente: number;
  IdMoneda: number;
  IdFormaPago: number;
  IdMedioPago: number;
  IdResolucion: number;
  Nota1: string | null;
  Nota2: string | null;
  Nota3: string | null;
}

interface MedioPago {
  Codigo: number;
  Descripcion: string;
}

interface Moneda {
  Codigo: number;
  Descripcion: string;
}

interface FormaPago {
  Codigo: number;
  Descripcion: string;
}

interface Resolucion {
  Codigo: number;
  Descripcion: string;
  InfoAdicional: string;
  InfoAdicional2: string;
}

const Company = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [parametros, setParametros] = useState<ParametrosEmpresa | null>(null);
  const [mediosPago, setMediosPago] = useState<MedioPago[]>([]);
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [formasPago, setFormasPago] = useState<FormaPago[]>([]);
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);

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
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          throw new Error("No se encontró el token de autenticación");
        }

        const headers = {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        };

        // Fetch all data in parallel
        const [responseEmpresa, responseParametros, responseMediosPago, responseMonedas, responseFormasPago, responseResoluciones] = await Promise.all([
          fetch(getApiUrl(`/Empresa/TraerEmpresa?IdEmpresa=${companyId}`), { headers }),
          fetch(getApiUrl(`/Empresa/TraerParametros?IdEmpresa=${companyId}`), { headers }),
          fetch(getApiUrl(`/Auxiliar/ListaMediosPago`), { headers }),
          fetch(getApiUrl(`/Auxiliar/ListaMonedas`), { headers }),
          fetch(getApiUrl(`/Auxiliar/ListaFormasPago`), { headers }),
          fetch(getApiUrl(`/Empresa/TraerResoluciones?IdEmpresa=${companyId}`), { headers })
        ]);

        if (!responseEmpresa.ok) {
          throw new Error("Error al cargar los datos de la empresa");
        }

        const dataEmpresa = await responseEmpresa.json();
        if (dataEmpresa.basePresentation) {
          setCompany(dataEmpresa.basePresentation);
        }

        if (responseParametros.ok) {
          const dataParametros = await responseParametros.json();
          if (dataParametros.basePresentation) {
            setParametros(dataParametros.basePresentation);
          }
        }

        if (responseMediosPago.ok) {
          const dataMediosPago = await responseMediosPago.json();
          if (dataMediosPago.basePresentationList) {
            setMediosPago(dataMediosPago.basePresentationList);
          }
        }

        if (responseMonedas.ok) {
          const dataMonedas = await responseMonedas.json();
          if (dataMonedas.basePresentationList) {
            setMonedas(dataMonedas.basePresentationList);
          }
        }

        if (responseFormasPago.ok) {
          const dataFormasPago = await responseFormasPago.json();
          if (dataFormasPago.basePresentationList) {
            setFormasPago(dataFormasPago.basePresentationList);
          }
        }

        if (responseResoluciones.ok) {
          const dataResoluciones = await responseResoluciones.json();
          if (dataResoluciones.basePresentationList) {
            setResoluciones(dataResoluciones.basePresentationList);
          }
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

  const getMedioPagoNombre = (id: number) => {
    const medioPago = mediosPago.find(m => m.Codigo === id);
    return medioPago ? medioPago.Descripcion : id.toString();
  };

  const getMonedaNombre = (id: number) => {
    const moneda = monedas.find(m => m.Codigo === id);
    return moneda ? moneda.Descripcion : id.toString();
  };

  const getFormaPagoNombre = (id: number) => {
    const formaPago = formasPago.find(f => f.Codigo === id);
    return formaPago ? formaPago.Descripcion : id.toString();
  };

  const handleSaveParametros = async () => {
    if (!parametros) return;

    setSaving(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const companyId = localStorage.getItem("companyId");
      
      if (!authToken || !companyId) {
        throw new Error("No se encontró autenticación");
      }

      const response = await fetch(getApiUrl(`/Empresa/ActualizarParametros`), {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...parametros,
          IdEmpresa: parseInt(companyId)
        })
      });

      if (!response.ok) {
        throw new Error("Error al actualizar los parámetros");
      }

      toast({
        title: t("company.success"),
        description: t("company.parametersUpdated"),
      });
    } catch (error) {
      toast({
        title: t("company.error"),
        description: t("company.parametersUpdateError"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-3xl font-bold tracking-tight">{t("company.title")}</h1>
        <p className="text-muted-foreground">{t("company.subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t("company.generalInfo")}</CardTitle>
              <CardDescription>{t("company.generalInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("company.companyName")} *</Label>
                  <Input id="name" value={company?.Nombre || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">{t("company.taxId")} *</Label>
                  <Input id="taxId" value={company?.Nit || ""} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t("company.address")} *</Label>
                <Input id="address" value={company?.Direccion || ""} readOnly />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">{t("company.city")} *</Label>
                  <Input id="city" placeholder="Madrid" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">{t("company.postalCode")} *</Label>
                  <Input id="postalCode" placeholder="28001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">{t("company.country")} *</Label>
                  <Select defaultValue="es">
                    <SelectTrigger id="country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">{t("invoices.spain")}</SelectItem>
                      <SelectItem value="co">{t("invoices.colombia")}</SelectItem>
                      <SelectItem value="other">{t("invoices.international")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t("company.contactInfo")}</CardTitle>
              <CardDescription>{t("company.contactInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("company.email")} *</Label>
                  <Input id="email" type="email" value={company?.Email || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("company.phone")} *</Label>
                  <Input id="phone" value={company?.Telefono || ""} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">{t("company.website")}</Label>
                <Input id="website" placeholder="https://www.empresa.com" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t("company.taxConfig")}</CardTitle>
              <CardDescription>{t("company.taxConfigDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="idCliente">{t("company.idClient")}</Label>
                  <Input 
                    id="idCliente" 
                    value={parametros?.IdCliente || ""} 
                    onChange={(e) => setParametros(prev => prev ? {...prev, IdCliente: parseInt(e.target.value) || 0} : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moneda">{t("company.currency")}</Label>
                  <Select 
                    value={parametros?.IdMoneda?.toString() || ""} 
                    onValueChange={(value) => setParametros(prev => prev ? {...prev, IdMoneda: parseInt(value)} : null)}
                  >
                    <SelectTrigger id="moneda">
                      <SelectValue placeholder={t("company.selectCurrency")} />
                    </SelectTrigger>
                    <SelectContent>
                      {monedas.map((moneda) => (
                        <SelectItem key={moneda.Codigo} value={moneda.Codigo.toString()}>
                          {moneda.Descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="formaPago">{t("company.paymentMethod")}</Label>
                  <Select 
                    value={parametros?.IdFormaPago?.toString() || ""} 
                    onValueChange={(value) => setParametros(prev => prev ? {...prev, IdFormaPago: parseInt(value)} : null)}
                  >
                    <SelectTrigger id="formaPago">
                      <SelectValue placeholder={t("company.selectPaymentMethod")} />
                    </SelectTrigger>
                    <SelectContent>
                      {formasPago.map((forma) => (
                        <SelectItem key={forma.Codigo} value={forma.Codigo.toString()}>
                          {forma.Descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medioPago">{t("company.paymentMeans")}</Label>
                  <Select 
                    value={parametros?.IdMedioPago?.toString() || ""} 
                    onValueChange={(value) => setParametros(prev => prev ? {...prev, IdMedioPago: parseInt(value)} : null)}
                  >
                    <SelectTrigger id="medioPago">
                      <SelectValue placeholder={t("company.selectPaymentMeans")} />
                    </SelectTrigger>
                    <SelectContent>
                      {mediosPago.map((medio) => (
                        <SelectItem key={medio.Codigo} value={medio.Codigo.toString()}>
                          {medio.Descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolucion">{t("company.resolution")}</Label>
                <Select 
                  value={parametros?.IdResolucion?.toString() || ""} 
                  onValueChange={(value) => setParametros(prev => prev ? {...prev, IdResolucion: parseInt(value)} : null)}
                >
                  <SelectTrigger id="resolucion">
                    <SelectValue placeholder={t("company.selectResolution")} />
                  </SelectTrigger>
                  <SelectContent>
                    {resoluciones.map((resolucion) => (
                      <SelectItem key={resolucion.Codigo} value={resolucion.Codigo.toString()}>
                        {resolucion.Descripcion} - {resolucion.InfoAdicional2} - {resolucion.InfoAdicional}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nota1">{t("company.taxNote1")}</Label>
                <Textarea
                  id="nota1"
                  value={parametros?.Nota1 || ""}
                  onChange={(e) => setParametros(prev => prev ? {...prev, Nota1: e.target.value} : null)}
                  placeholder={t("company.firstTaxNotePlaceholder")}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nota2">{t("company.taxNote2")}</Label>
                <Textarea
                  id="nota2"
                  value={parametros?.Nota2 || ""}
                  onChange={(e) => setParametros(prev => prev ? {...prev, Nota2: e.target.value} : null)}
                  placeholder={t("company.secondTaxNotePlaceholder")}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nota3">{t("company.taxNote3")}</Label>
                <Textarea
                  id="nota3"
                  value={parametros?.Nota3 || ""}
                  onChange={(e) => setParametros(prev => prev ? {...prev, Nota3: e.target.value} : null)}
                  placeholder={t("company.thirdTaxNotePlaceholder")}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline">{t("common.cancel")}</Button>
            <Button className="gap-2" onClick={handleSaveParametros} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t("company.saveChanges")}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{t("company.logo")}</CardTitle>
              <CardDescription>{t("company.logoDesc")}</CardDescription>
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
                  {t("company.uploadLogo")}
                </Button>
                <p className="text-center text-xs text-muted-foreground whitespace-pre-line">
                  {t("company.logoSpecs")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary shadow-lg">
            <CardHeader>
              <CardTitle className="text-base">{t("company.digitalCertificates")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-muted/50 p-3 opacity-60">
                <p className="text-sm font-medium">{t("company.spainVerifactu")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.comingSoon")}</p>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <p className="text-sm font-medium">{t("company.colombiaDian")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("company.dianEnvironment")}: {company?.AmbienteDian === 1 ? t("company.production") : t("company.test")}
                </p>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  {t("company.configure")}
                </Button>
              </div>
              
              <div className="rounded-lg border bg-muted/50 p-3 space-y-1 opacity-60">
                <p className="text-sm font-medium">{t("company.statistics")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.comingSoon")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Company;
