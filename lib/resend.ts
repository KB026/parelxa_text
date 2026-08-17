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

export interface BundleDemoToolEmailInfo {
  name: string;
  role_in_workflow?: string;
}

export async function sendBundleDemoRequestEmail(params: {
  recipients: string[];
  bundleName: string;
  userEmail: string;
  company: string;
  timeline: string;
  selectedTools: BundleDemoToolEmailInfo[];
}) {
  try {
    const toolsHtml = params.selectedTools
      .map(
        t => `
      <div class="tool-item">
        <div class="tool-name">${t.name}</div>
        <div class="tool-role">${t.role_in_workflow || 'Integrated Tool in Stack'}</div>
      </div>
    `
      )
      .join('');

    const html = loadTemplate('bundle-demo-request', {
      BUNDLE_NAME: params.bundleName,
      USER_EMAIL: params.userEmail,
      COMPANY: params.company,
      TIMELINE: params.timeline,
      VENDOR_COUNT: String(params.selectedTools.length),
      SELECTED_TOOLS_HTML: toolsHtml,
      REQUEST_DATE: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    });

    const recipientList = params.recipients.filter(Boolean);
    if (recipientList.length === 0) {
      recipientList.push('admin@parlexa.in');
    }

    return await resend.emails.send({
      from: 'noreply@parlexa.in',
      to: recipientList,
      cc: ['admin@parlexa.in'],
      subject: `🔥 Multi-Vendor Demo Request: ${params.bundleName} (${params.selectedTools.length} Tools)`,
      html
    });
  } catch (error) {
    console.error('Bundle demo request email error:', error);
    // Non-blocking in production if Resend API key is mock or sandbox
    return { success: false, error };
  }
}

export async function sendBundleDocsEmail(email: string, bundleName: string, bundleSlug: string) {
  try {
    const docsLink = `https://parlexa.in/bundles/${bundleSlug}/docs`;
    const html = loadTemplate('bundle-docs', {
      BUNDLE_NAME: bundleName,
      DOCS_LINK: docsLink
    });

    return await resend.emails.send({
      from: 'noreply@parlexa.in',
      to: email,
      subject: `⚡ Your ${bundleName} Deployment Documentation Link`,
      html
    });
  } catch (error) {
    console.error('Send bundle docs email error:', error);
    return { success: false, error };
  }
}

