import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

// Planes configurados con Stripe
const plans = [
  {
    name: "Básico",
    monthlyPrice: "85.000",
    yearlyPrice: "867.000",
    productIdMonthly: "prod_TKd60UFqKmDlzQ",
    priceIdMonthly: "price_1SNxppRRbSHLnGlJXYxPhBdR",
    productIdYearly: "prod_TKd6iG3LlGuirH",
    priceIdYearly: "price_1SNxq9RRbSHLnGlJENWm1LMA",
    features: [
      "2 usuarios",
      "5 facturas/mes",
      "$400 COP por factura adicional",
      "Verifactu incluido",
      "Soporte Estándar",
      "Representación PDF",
      "Almacenamiento en Nube",
    ],
  },
  {
    name: "PRO",
    monthlyPrice: "170.500",
    yearlyPrice: "1.739.100",
    productIdMonthly: "prod_TKd6CIJiPcB3O6",
    priceIdMonthly: "price_1SNxqJRRbSHLnGlJU40P5LJN",
    productIdYearly: "prod_TKd6x4yGqPjBAl",
    priceIdYearly: "price_1SNxqSRRbSHLnGlJJnuJoyWm",
    popular: true,
    features: [
      "5 usuarios",
      "50 facturas/mes",
      "$300 COP por factura adicional",
      "Verifactu incluido",
      "Soporte Premium",
      "Representación PDF",
      "Dashboard completo",
      "Almacenamiento en Nube",
    ],
  },
  {
    name: "Empresarial",
    monthlyPrice: "507.700",
    yearlyPrice: "5.178.360",
    productIdMonthly: "prod_TKd69LD8vtK22s",
    priceIdMonthly: "price_1SNxqlRRbSHLnGlJJNIotcyq",
    productIdYearly: "prod_TKd7pyQFlwjlXA",
    priceIdYearly: "price_1SNxr2RRbSHLnGlJQckPCYkh",
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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedPriceId, setSelectedPriceId] = useState("");
  const [selectedPlanName, setSelectedPlanName] = useState("");

  const handleSubscribeClick = (priceId: string, planName: string) => {
    setSelectedPriceId(priceId);
    setSelectedPlanName(planName);
    
    // Check if email is stored
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail && storedEmail.includes("@")) {
      setUserEmail(storedEmail);
      handleSubscribe(priceId, planName, storedEmail);
    } else {
      setShowEmailDialog(true);
    }
  };

  const handleEmailSubmit = () => {
    if (!userEmail || !userEmail.includes("@")) {
      toast({
        title: t("common.error"),
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem("userEmail", userEmail);
    setShowEmailDialog(false);
    handleSubscribe(selectedPriceId, selectedPlanName, userEmail);
  };

  const handleSubscribe = async (priceId: string, planName: string, email: string) => {
    try {
      setLoadingPlan(priceId);

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, email },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        setTimeout(() => checkSubscription(), 5000);
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al crear la suscripción";
      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const storedEmail = localStorage.getItem("userEmail");
      
      if (!storedEmail || !storedEmail.includes("@")) {
        toast({
          title: t("common.error"),
          description: "Por favor ingresa tu email primero",
          variant: "destructive",
        });
        setShowEmailDialog(true);
        return;
      }

      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: { email: storedEmail },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: t("common.error"),
        description: t("subscription.portalError"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={billingCycle} onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="monthly">{t("subscription.monthly")}</TabsTrigger>
          <TabsTrigger value="yearly">
            {t("subscription.yearly")}
            <Badge variant="secondary" className="ml-2">{t("subscription.yearlyDiscount")}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={billingCycle} className="mt-8">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const currentProductId = billingCycle === "monthly" ? plan.productIdMonthly : plan.productIdYearly;
              const currentPriceId = billingCycle === "monthly" ? plan.priceIdMonthly : plan.priceIdYearly;
              const displayPrice = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
              const isCurrentPlan = productId === currentProductId;
        
              return (
                <Card
                  key={`${plan.name}-${billingCycle}`}
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
                      {t("subscription.mostPopular")}
                    </Badge>
                  )}
                  {isCurrentPlan && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500">
                      {t("subscription.yourCurrentPlan")}
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-4xl font-bold text-foreground">${displayPrice}</span>
                      <span className="text-muted-foreground">/{billingCycle === "monthly" ? t("subscription.month") : t("subscription.year")}</span>
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
                        {t("subscription.manageSubscription")}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleSubscribeClick(currentPriceId, plan.name)}
                        disabled={loadingPlan === currentPriceId}
                      >
                        {loadingPlan === currentPriceId ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("subscription.processing")}
                          </>
                        ) : (
                          t("subscription.subscribe")
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingresa tu email</DialogTitle>
            <DialogDescription>
              Necesitamos tu email para gestionar tu suscripción
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEmailSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEmailSubmit}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
