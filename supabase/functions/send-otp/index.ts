import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendOtpRequest {
  email: string;
}

// Generate a 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendOtpRequest = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting: Check how many OTPs were sent in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentOtps, error: countError } = await supabase
      .from("otp_verifications")
      .select("id")
      .eq("email", email.toLowerCase())
      .gte("created_at", fiveMinutesAgo);

    if (countError) {
      console.error("Error checking rate limit:", countError);
      return new Response(
        JSON.stringify({ error: "Failed to process request" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (recentOtps && recentOtps.length >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a few minutes before trying again." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Invalidate previous OTPs for this email
    await supabase
      .from("otp_verifications")
      .update({ verified: true })
      .eq("email", email.toLowerCase())
      .eq("verified", false);

    // Generate new OTP
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store OTP in database
    const { error: insertError } = await supabase
      .from("otp_verifications")
      .insert({
        email: email.toLowerCase(),
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        verified: false,
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate verification code" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log OTP for debugging (remove in production)
    console.log(`OTP for ${email}: ${otpCode}`);

    // Send email using Resend if API key is available
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        
        const emailResult = await resend.emails.send({
          from: "Health Hub <onboarding@resend.dev>",
          to: [email.toLowerCase()],
          subject: "Your Health Hub Verification Code",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background-color: #f5f5f5;">
              <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #06b6d4); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 28px;">💚</span>
                  </div>
                  <h1 style="margin: 0; font-size: 24px; color: #1f2937;">Verify your email</h1>
                </div>
                
                <p style="color: #6b7280; text-align: center; margin-bottom: 30px;">
                  Enter this code to complete your Health Hub registration:
                </p>
                
                <div style="background: linear-gradient(135deg, #10b981, #06b6d4); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
                  <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px;">${otpCode}</span>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-bottom: 20px;">
                  This code expires in 10 minutes.
                </p>
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                  If you didn't request this code, you can safely ignore this email.
                </p>
              </div>
            </body>
            </html>
          `,
        });

        console.log("Email sent successfully:", emailResult);
      } catch (emailError) {
        console.error("Failed to send email via Resend:", emailError);
        // Continue anyway - OTP is stored and can be verified
      }
    } else {
      console.log("RESEND_API_KEY not configured, OTP stored but email not sent");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent to your email",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
