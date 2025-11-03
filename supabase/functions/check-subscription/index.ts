import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const paddleApiKey = Deno.env.get("PADDLE_API_KEY");
    if (!paddleApiKey) throw new Error("PADDLE_API_KEY is not set");
    logStep("Paddle key verified");

    const { email } = await req.json();
    
    if (!email) {
      logStep("No email provided");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Email provided", { email });

    // Get customer from Paddle
    const customerResponse = await fetch(`https://api.paddle.com/customers?email=${encodeURIComponent(email)}`, {
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
      },
    });

    if (!customerResponse.ok) {
      logStep("No customer found in Paddle");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerData = await customerResponse.json();
    
    if (!customerData.data || customerData.data.length === 0) {
      logStep("No customer found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customerData.data[0].id;
    logStep("Found Paddle customer", { customerId });

    // Get active subscriptions for the customer
    const subscriptionsResponse = await fetch(`https://api.paddle.com/subscriptions?customer_id=${customerId}&status=active`, {
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
      },
    });

    if (!subscriptionsResponse.ok) {
      logStep("Error fetching subscriptions");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscriptionsData = await subscriptionsResponse.json();
    const hasActiveSub = subscriptionsData.data && subscriptionsData.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptionsData.data[0];
      subscriptionEnd = subscription.current_billing_period?.ends_at || null;
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      productId = subscription.items[0]?.price?.product_id || null;
      logStep("Determined subscription tier", { productId });
    } else {
      logStep("No active subscription found");
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
