import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

const loadTemplate = (templateName: string, variables: Record<string, string>): string => {
  const templatePath = path.join(process.cwd(), 'lib', 'email-templates', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf-8');
  
  Object.entries(variables).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  
  return html;
};

export async function sendVerificationEmail(email: string, verificationLink: string) {
  try {
    const html = loadTemplate('verify-email', {
      VERIFICATION_LINK: verificationLink,
    });
    
    return await resend.emails.send({
      from: 'noreply@parlexa.in',
      to: email,
      subject: 'Verify your Parlexa account',
      html,
    });
  } catch (error) {
    console.error('Verification email error:', error);
    throw error;
  }
}

export async function sendToolApprovedEmail(vendorEmail: string, toolName: string, toolSlug: string) {
  try {
    const html = loadTemplate('tool-approved', {
      TOOL_NAME: toolName,
      TOOL_SLUG: toolSlug,
    });
    
    return await resend.emails.send({
      from: 'noreply@parlexa.in',
      to: vendorEmail,
      subject: `✓ ${toolName} has been approved on Parlexa!`,
      html,
    });
  } catch (error) {
    console.error('Approval email error:', error);
    throw error;
  }
}

export async function sendToolRejectedEmail(vendorEmail: string, vendorName: string, toolName: string, feedback: string) {
  try {
    const html = loadTemplate('tool-rejected', {
      VENDOR_NAME: vendorName,
      TOOL_NAME: toolName,
      FEEDBACK: feedback,
    });
    
    return await resend.emails.send({
      from: 'noreply@parlexa.in',
      to: vendorEmail,
      subject: `${toolName} needs review - Parlexa`,
      html,
    });
  } catch (error) {
    console.error('Rejection email error:', error);
    throw error;
  }
}

export async function sendVendorMessageEmail(vendorEmail: string, toolName: string, message: string) {
  try {
    const html = loadTemplate('vendor-message', {
      TOOL_NAME: toolName,
      MESSAGE: message,
    });
    
    return await resend.emails.send({
      from: 'noreply@parlexa.in',
      to: vendorEmail,
      subject: `New message about ${toolName} - Parlexa`,
      html,
    });
  } catch (error) {
    console.error('Message email error:', error);
    throw error;
  }
}
