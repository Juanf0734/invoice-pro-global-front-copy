import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionContextType {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  planName: string;
  checkSubscription: () => Promise<void>;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const SUBSCRIPTION_PLANS = {
  // Planes mensuales
  "prod_TKd60UFqKmDlzQ": { name: "Básico", priceId: "price_1SNxppRRbSHLnGlJXYxPhBdR", interval: "monthly" },
  "prod_TKd6CIJiPcB3O6": { name: "PRO", priceId: "price_1SNxqJRRbSHLnGlJU40P5LJN", interval: "monthly" },
  "prod_TKd69LD8vtK22s": { name: "Empresarial", priceId: "price_1SNxqlRRbSHLnGlJJNIotcyq", interval: "monthly" },
  // Planes anuales
  "prod_TKd6iG3LlGuirH": { name: "Básico", priceId: "price_1SNxq9RRbSHLnGlJENWm1LMA", interval: "yearly" },
  "prod_TKd6x4yGqPjBAl": { name: "PRO", priceId: "price_1SNxqSRRbSHLnGlJJnuJoyWm", interval: "yearly" },
  "prod_TKd7pyQFlwjlXA": { name: "Empresarial", priceId: "price_1SNxr2RRbSHLnGlJQckPCYkh", interval: "yearly" },
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscribed, setSubscribed] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSubscribed(false);
        setProductId(null);
        setSubscriptionEnd(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-subscription");

      if (error) throw error;

      setSubscribed(data.subscribed || false);
      setProductId(data.product_id || null);
      setSubscriptionEnd(data.subscription_end || null);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscribed(false);
      setProductId(null);
      setSubscriptionEnd(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();

    // Check subscription every minute
    const interval = setInterval(checkSubscription, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const planName = productId && SUBSCRIPTION_PLANS[productId as keyof typeof SUBSCRIPTION_PLANS]
    ? SUBSCRIPTION_PLANS[productId as keyof typeof SUBSCRIPTION_PLANS].name
    : "Gratis";

  return (
    <SubscriptionContext.Provider
      value={{
        subscribed,
        productId,
        subscriptionEnd,
        planName,
        checkSubscription,
        loading,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}

export { SUBSCRIPTION_PLANS };
