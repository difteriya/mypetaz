import 'server-only';

// Pluggable email (PLAN.md §3). Uses Resend's HTTP API when RESEND_API_KEY is
// set; otherwise no-ops (logs) so dev/unconfigured environments never fail.
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'mypet.az <onboarding@resend.dev>';

  if (!key) {
    console.log(`[email:noop] → ${to} · ${subject}`);
    return;
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
    });
  } catch (err) {
    console.error('[email] send failed:', err);
  }
}
