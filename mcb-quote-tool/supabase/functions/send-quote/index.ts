import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { email, message, pdfBase64, customerName } = await req.json();

        // 1. Check for API Key
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
            throw new Error('Missing RESEND_API_KEY environment variable.');
        }

        // 2. Initialize Resend
        const resend = new Resend(resendApiKey);

        // 3. Send Email
        const { data, error } = await resend.emails.send({
            from: 'Modern Curtains <quotes@yourdomain.com>', // User needs to configure this
            to: [email],
            subject: `Your Quote from Modern Curtains & Blinds`,
            html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
            attachments: [
                {
                    filename: `Quote - ${customerName}.pdf`,
                    content: pdfBase64, // Resend handles base64 content
                },
            ],
        });

        if (error) {
            throw error;
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
