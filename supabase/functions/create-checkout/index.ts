import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId, email } = await req.json();
    if (!priceId) throw new Error("Price ID is required");
    if (!email) throw new Error("Email is required");

    const paddleApiKey = Deno.env.get("PADDLE_API_KEY");
    if (!paddleApiKey) throw new Error("PADDLE_API_KEY is not set");

    // Create a transaction with Paddle
    const response = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            price_id: priceId,
            quantity: 1,
          },
        ],
        customer_email: email,
        custom_data: {
          user_email: email,
        },
        checkout: {
          success_url: `${req.headers.get("origin")}/settings?tab=subscription&success=true`,
          cancel_url: `${req.headers.get("origin")}/settings?tab=subscription&canceled=true`,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Paddle API error:", errorData);
      
      // Handle specific Paddle errors
      if (errorData.error?.code === "transaction_checkout_not_enabled") {
        throw new Error("El checkout de Paddle no está habilitado. Por favor completa el proceso de onboarding en Paddle.");
      }
      
      throw new Error(`Error de Paddle: ${errorData.error?.detail || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({ url: data.data.checkout.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
