import { sendEmail } from './resend';
import { templates } from './templates';
import { generateUnsubscribeToken } from '@/lib/signed-tokens';

export async function sendWelcomeEmail(email: string, name: string, role: 'user' | 'vendor') {
  const html = role === 'vendor' 
    ? templates.welcomeLister(name) 
    : templates.welcomeConsumer(name);
  
  const subject = role === 'vendor' 
    ? 'Welcome to the Parlexa Global Vendor Network! ðŸš€'
    : 'Welcome to Parlexa â€” Your Global AI Gateway ðŸ‘‹';

  return sendEmail({ to: email, subject, html });
}

export async function sendOTPEmail(email: string, code: string) {
  const html = templates.otp(code);
  return sendEmail({ to: email, subject: 'Verify your Parlexa account', html });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const html = templates.passwordReset(resetUrl);
  return sendEmail({ to: email, subject: 'Reset your Parlexa password', html });
}

export async function sendSubmissionConfirmation(email: string, toolName: string) {
  const html = templates.listingSubmitted(toolName);
  return sendEmail({ to: email, subject: `Submission Received: ${toolName} â³`, html });
}

export async function sendListingStatusUpdate(email: string, toolName: string, status: 'approved' | 'rejected' | 'changes_requested', meta: { liveUrl?: string, reason?: string }) {
  const html = status === 'approved' 
    ? templates.listingApproved(toolName, meta.liveUrl || '')
    : templates.listingRejected(toolName, meta.reason || 'Does not meet our current quality standards.');
  
  const subject = status === 'approved'
    ? `Congratulations! ${toolName} is now live! ðŸŽ‰`
    : `Action required: Your submission for ${toolName} ðŸ“`;

  return sendEmail({ to: email, subject, html });
}

export async function sendReviewAlert(email: string, toolName: string, rating: number, reviewer: string) {
  const html = templates.reviewAlert(toolName, rating, reviewer);
  return sendEmail({ to: email, subject: `New ${rating}-Star Review for ${toolName} â­`, html });
}

export async function sendReplyAlert(email: string, toolName: string) {
  const html = templates.replyAlert(toolName);
  return sendEmail({ to: email, subject: `The ${toolName} team has responded! ðŸ’¬`, html });
}

export async function sendVerificationUpdate(email: string, toolName: string, approved: boolean, reason?: string) {
  const html = templates.verificationStatus(toolName, approved, reason);
  return sendEmail({ to: email, subject: approved ? `âœ“ ${toolName} is now Verified!` : `Verification update for ${toolName}`, html });
}

export async function sendFeaturedAlert(email: string, toolName: string, expiring: boolean) {
  const html = templates.featuredAlert(toolName, expiring);
  const subject = expiring ? `Your promotion for ${toolName} is expiring soon â³` : `Your featured slot for ${toolName} is ACTIVE! ðŸ”¥`;
  return sendEmail({ to: email, subject, html });
}

// Marketing Emails (with unsubscribe tokens)
export async function sendSavedToolVerifiedAlert(email: string, toolName: string, slug: string, userId: string) {
  // âœ… Use signed token instead of userId (secure)
  const unsubscribeToken = generateUnsubscribeToken(userId, 'verified_alert');
  const unsubscribeLink = `https://parlexa.in/api/email/unsubscribe?token=${unsubscribeToken}`;
  const html = templates.savedToolVerified(toolName, slug, unsubscribeLink);
  return sendEmail({ to: email, subject: `âœ“ Verification Alert: ${toolName}`, html });
}

export async function sendClaimVerification(email: string, toolName: string, token: string) {
  const verifyUrl = `https://parlexa.in/claims/verify?token=${token}`;
  const html = templates.claimVerification(toolName, verifyUrl);
  return sendEmail({ to: email, subject: `Action Required: Verify ownership of ${toolName}`, html });
}

export async function sendClaimApproved(email: string, toolName: string) {
  const html = templates.claimApproved(toolName);
  return sendEmail({ to: email, subject: `Claim Approved: You now own ${toolName}! ðŸŽ‰`, html });
}

export async function sendClaimDisputed(email: string, toolName: string) {
  const html = templates.claimDisputed(toolName);
  return sendEmail({ to: email, subject: `Security Alert: Ownership dispute for ${toolName}`, html });
}
