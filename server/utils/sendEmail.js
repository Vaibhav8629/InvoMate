const { Resend } = require("resend");

const sendEmail = async ({ to, subject, html, from }) => {
  if (!process.env.RESEND_API_KEY) {
    const err = new Error("RESEND_API_KEY is not configured.");
    console.error(err);
    throw err;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const response = await resend.emails.send({
      from: from || process.env.RESEND_FROM || "InvoMate <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("✅ Resend: email queued/sent", { to, id: response?.id });
    return response;
  } catch (err) {
    // Log as much as possible without throwing unsafe objects
    try {
      console.error("❌ Resend send failed:", err?.message || err);
      if (err?.status) console.error("Resend status:", err.status);
      if (err?.response) console.error("Resend response:", JSON.stringify(err.response, Object.getOwnPropertyNames(err.response)));
    } catch (logErr) {
      console.error("Error while logging resend error", logErr);
    }
    throw err;
  }
};

module.exports = sendEmail;