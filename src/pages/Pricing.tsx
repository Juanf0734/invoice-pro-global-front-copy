import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ebillLogo from "@/assets/ebill-logo.png";

const plans = [
  {
    name: "Básico",
    price: "14,90",
    features: [
      "2 usuarios",
      "5 facturas/mes",
      "€0.07 por factura adicional",
      "Verifactu incluido",
      "Soporte Estándar",
      "Representación PDF",
      "Almacenamiento en Nube",
    ],
  },
  {
    name: "PRO",
    price: "29,90",
    popular: true,
    features: [
      "5 usuarios",
      "50 facturas/mes",
      "€0.05 por factura adicional",
      "Verifactu incluido",
      "Soporte Premium",
      "Representación PDF",
      "Dashboard completo",
      "Almacenamiento en Nube",
    ],
  },
  {
    name: "Empresarial",
    price: "89,00",
    features: [
      "10 usuarios",
      "800 facturas/mes",
      "Verifactu incluido",
      "Soporte Premium",
      "Representación PDF",
      "Dashboard completo",
      "Almacenamiento en Nube",
      "Integraciones (API)",
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ebillLogo} alt="eBill Pro" className="h-8 w-auto" />
            <div>
              <h1 className="text-xl font-bold">eBill Pro</h1>
              <p className="text-xs text-muted-foreground">
                {t("auth.platformSubtitle")}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate("/auth")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Planes y Precios
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elige el plan perfecto para tu negocio. Todos los planes incluyen facturación electrónica completa.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto mb-12 animate-fade-in">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative transition-all hover:shadow-xl ${
                plan.popular
                  ? "border-primary shadow-lg scale-105"
                  : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Más Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-4xl font-bold text-foreground">€{plan.price}</span>
                  <span className="text-muted-foreground">/mes</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate("/auth")}
                >
                  Comenzar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* PEPPOL Add-on */}
        <div className="max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "300ms" }}>
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Complemento PEPPOL
                <Badge variant="secondary">Opcional</Badge>
              </CardTitle>
              <CardDescription>
                Interoperabilidad PEPPOL para facturación internacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-lg mb-2">€39,00 / mes</p>
                  <p className="text-sm text-muted-foreground">
                    Valor por documento: €0,01
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <span className="text-sm">Red PEPPOL completa</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <span className="text-sm">Facturación internacional</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <span className="text-sm">Cumplimiento normativo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="mt-16 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h2 className="text-3xl font-bold text-center mb-8">
            Todas las funcionalidades incluidas
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Facturación Completa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Facturas electrónicas España y Colombia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Cumplimiento Verifactu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Representación PDF profesional</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gestión y Soporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Almacenamiento seguro en la nube</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Soporte técnico dedicado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Actualizaciones automáticas</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 space-y-4 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <h2 className="text-2xl font-bold">¿Listo para empezar?</h2>
          <p className="text-muted-foreground">
            Crea tu cuenta gratis y comienza a facturar en minutos
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
            Crear cuenta gratis
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 eBill Pro. Facturación electrónica profesional para PYMES.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
