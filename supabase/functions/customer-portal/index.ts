import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
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
    if (!email) throw new Error("Email is required");
    logStep("Email provided", { email });

    // Get customer from Paddle
    const customerResponse = await fetch(`https://api.paddle.com/customers?email=${encodeURIComponent(email)}`, {
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
      },
    });

    if (!customerResponse.ok) {
      throw new Error("No Paddle customer found for this user");
    }

    const customerData = await customerResponse.json();
    
    if (!customerData.data || customerData.data.length === 0) {
      throw new Error("No Paddle customer found for this user");
    }

    const customerId = customerData.data[0].id;
    logStep("Found Paddle customer", { customerId });

    // Paddle doesn't have a built-in portal session API like Stripe
    // Instead, we redirect to Paddle's subscription management page
    // Users can manage their subscriptions directly at Paddle
    const portalUrl = `https://checkout.paddle.com/subscription/manage/${customerId}`;
    logStep("Paddle portal URL created", { url: portalUrl });

    return new Response(JSON.stringify({ url: portalUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
