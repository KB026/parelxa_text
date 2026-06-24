// Using process.env.RESEND_API_KEY directly to avoid unused variable warnings

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from = 'Parlexa <notifications@parlexa.com>' }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Email will not be sent in reality.');
    return { success: false, error: 'API Key missing' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: from,
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', data);
      return { success: false, error: data.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: (error as Error).message };
  }
}
