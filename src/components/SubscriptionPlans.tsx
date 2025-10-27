import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription, SUBSCRIPTION_PLANS } from "@/contexts/SubscriptionContext";

const plans = [
  {
    name: "Básico",
    price: "14,90",
    productId: "prod_TJd09CpAxikwLx",
    priceId: "price_1SMzkPRRbSHLnGlJspYyg5q8",
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
    productId: "prod_TJd0D6ySk3RnJq",
    priceId: "price_1SMzkYRRbSHLnGlJQmN6eeUV",
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
    productId: "prod_TJd0Yhk7ZtTt65",
    priceId: "price_1SMzkhRRbSHLnGlJdG3yo8od",
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

export function SubscriptionPlans() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { productId, checkSubscription } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planName: string) => {
    try {
      setLoadingPlan(priceId);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para suscribirte",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        // Check subscription after a delay
        setTimeout(() => checkSubscription(), 5000);
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el proceso de suscripción",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Error",
        description: "No se pudo abrir el portal de suscripciones",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const isCurrentPlan = productId === plan.productId;
        
        return (
          <Card
            key={plan.name}
            className={`relative ${
              plan.popular
                ? "border-primary shadow-lg scale-105"
                : isCurrentPlan
                ? "border-green-500 shadow-md"
                : ""
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Más Popular
              </Badge>
            )}
            {isCurrentPlan && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500">
                Tu Plan Actual
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
              {isCurrentPlan ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleManageSubscription}
                >
                  Gestionar Suscripción
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(plan.priceId, plan.name)}
                  disabled={loadingPlan === plan.priceId}
                >
                  {loadingPlan === plan.priceId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Suscribirse"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
