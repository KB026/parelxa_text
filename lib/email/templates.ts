const LOGO_URL = 'https://parlexa.in/logo.png'; // Placeholder for the global logo
const ACCENT_COLOR = '#1565c0'; // var(--blue-primary)
const TEXT_COLOR = '#1e293b';
const MUTED_COLOR = '#64748b';

const baseLayout = (content: string, unsubscribeLink?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: ${TEXT_COLOR}; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { padding: 32px 40px; text-align: center; border-bottom: 1px solid #f1f5f9; }
    .content { padding: 40px; line-height: 1.6; font-size: 16px; }
    .footer { padding: 32px 40px; background-color: #f8fafc; text-align: center; font-size: 12px; color: ${MUTED_COLOR}; border-top: 1px solid #f1f5f9; }
    .button { display: inline-block; padding: 14px 28px; background-color: ${ACCENT_COLOR}; color: #ffffff !important; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
    .link { color: ${ACCENT_COLOR}; text-decoration: none; }
    h1 { font-size: 24px; font-weight: 800; margin: 0 0 16px; color: #0f172a; }
    p { margin: 0 0 16px; }
    .pill { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="Parlexa" height="40" style="object-fit: contain;" />
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>The global premier marketplace for AI agents and tools.</p>
      <p>&copy; 2026 Parlexa. All rights reserved.</p>
      ${unsubscribeLink ? `<p><a href="${unsubscribeLink}" style="color: ${MUTED_COLOR}; text-decoration: underline;">Unsubscribe from these updates</a></p>` : ''}
    </div>
  </div>
</body>
</html>
`;

export const templates = {
  // 0. Signup Verification
  signupVerification: (name: string, verifyUrl: string) => baseLayout(`
    <h1>Verify Your Email Address</h1>
    <p>Hi ${name},</p>
    <p>Welcome to Parlexa! Please click the button below to verify your email address and activate your account.</p>
    <a href="${verifyUrl}" class="button">Verify Email</a>
    <p style="margin-top: 24px; font-size: 14px; color: #64748b;">If you didn't create this account, you can safely ignore this email.</p>
  `),

  // 1. Welcome email (consumer)
  welcomeConsumer: (name: string) => baseLayout(`
    <h1>Welcome to the Parlexa Ecosystem, ${name}!</h1>
    <p>We're thrilled to have you on board. Parlexa is your gateway to discovering and integrating the most powerful AI agents built to scale businesses worldwide.</p>
    <p>Start exploring our curated directory of specialized AI tools today.</p>
    <a href="https://parlexa.in/products" class="button">Explore AI Agents</a>
  `),

  // 2. Welcome email (lister)
  welcomeLister: (name: string) => baseLayout(`
    <div class="pill" style="background: rgba(21, 101, 192, 0.1); color: ${ACCENT_COLOR};">Vendor Account Activated</div>
    <h1>Welcome to the Global Vendor Network, ${name}!</h1>
    <p>Your workspace is ready. Parlexa is the world's premier platform for showcasing your AI solutions to global enterprises.</p>
    <p><strong>Next Steps:</strong></p>
    <ul>
      <li>Complete your vendor profile</li>
      <li>Submit your first AI tool for moderation</li>
      <li>Get verified to build enterprise trust</li>
    </ul>
    <a href="https://parlexa.in/vendor/listings/new" class="button">Submit Your First Tool</a>
  `),

  // 3. Email OTP verification
  otp: (code: string) => baseLayout(`
    <h1>Verify your email</h1>
    <p>Enter the following code to verify your account and get started with Parlexa.</p>
    <div style="background: #f1f5f9; padding: 24px; border-radius: 12px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; margin: 24px 0; color: #0f172a;">
      ${code}
    </div>
    <p style="font-size: 14px; color: ${MUTED_COLOR};">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
  `),

  // 4. Listing submitted confirmation
  listingSubmitted: (toolName: string) => baseLayout(`
    <h1>Submission Received: ${toolName}</h1>
    <p>Thank you for listing your tool on Parlexa. Our moderation team is currently reviewing your submission to ensure it meets our quality standards for global enterprises.</p>
    <p><strong>Status:</strong> Under Review</p>
    <p>You will receive an email once our team has completed the review process (usually within 24-48 hours).</p>
    <a href="https://parlexa.in/vendor/listings" class="button">View Submission Status</a>
  `),

  // 5. Listing approved
  listingApproved: (toolName: string, liveUrl: string) => baseLayout(`
    <div class="pill" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">Listing Approved</div>
    <h1>Congratulations! ${toolName} is Live!</h1>
    <p>Your tool has been approved and is now discoverable by thousands of enterprise buyers on the Parlexa global marketplace.</p>
    <p>You can now view your live listing and start collecting verified reviews.</p>
    <a href="${liveUrl}" class="button">Visit Live Page</a>
  `),

  // 6. Listing rejected
  listingRejected: (toolName: string, reason: string) => baseLayout(`
    <div class="pill" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">Action Required</div>
    <h1>Update needed for ${toolName}</h1>
    <p>Our moderation team has reviewed your submission and determined that some adjustments are needed before it can go live.</p>
    <p><strong>Reason for rejection:</strong></p>
    <div style="background: #fff1f2; border-left: 4px solid #f43f5e; padding: 16px; margin: 20px 0; color: #9f1239;">
      ${reason}
    </div>
    <p>Please update your listing in the vendor portal and re-submit for review.</p>
    <a href="https://parlexa.in/vendor/listings" class="button">Edit Listing</a>
  `),

  // 7. New review on your tool
  reviewAlert: (toolName: string, rating: number, reviewer: string) => baseLayout(`
    <h1>New ${rating}-Star Review for ${toolName}</h1>
    <p><strong>${reviewer}</strong> just left a review on your tool. Responding to reviews is a great way to build trust with potential customers.</p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin: 20px 0;">
      <div style="color: #fbbf24; font-size: 20px; margin-bottom: 8px;">${'★'.repeat(Math.round(rating))}${ '☆'.repeat(5 - Math.round(rating))}</div>
      <p style="font-style: italic; color: ${TEXT_COLOR}; margin: 0;">Log in to the vendor portal to read the full review and post your response.</p>
    </div>
    <a href="https://parlexa.in/vendor/reviews" class="button">Respond to Review</a>
  `),

  // 8. Lister replied to your review
  replyAlert: (toolName: string) => baseLayout(`
    <h1>The ${toolName} team has responded!</h1>
    <p>The vendor has posted a response to your review on Parlexa. Your feedback helps the community and helps tools improve.</p>
    <p>Click below to view the response on the product page.</p>
    <a href="https://parlexa.in/products/${toolName.toLowerCase().replace(/ /g, '-')}" class="button">View Response</a>
  `),

  // 9. Verification Approved/Rejected
  verificationStatus: (toolName: string, approved: boolean, reason?: string) => baseLayout(`
    <div class="pill" style="background: ${approved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${approved ? '#10b981' : '#ef4444'};">Verification Update</div>
    <h1>${approved ? `Verified: ${toolName} is now Verified!` : `Verification update for ${toolName}`}</h1>
    <p>${approved 
      ? `Your verification request has been approved. The blue Verified badge has been added to your listing, signaling trust to global enterprise buyers.`
      : `Your verification request could not be approved at this time.`}</p>
    ${!approved && reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <a href="https://parlexa.in/products/${toolName.toLowerCase().replace(/ /g, '-')}" class="button">${approved ? 'View Verified Listing' : 'Manage Verification'}</a>
  `),

  // 10. Featured Listing Active / Expiring
  featuredAlert: (toolName: string, expiring: boolean) => baseLayout(`
    <div class="pill" style="background: rgba(245, 158, 11, 0.1); color: #d97706;">Promotion Status</div>
    <h1>${expiring ? `Your promotion for ${toolName} is expiring soon` : `Your featured slot for ${toolName} is ACTIVE!`}</h1>
    <p>${expiring 
      ? `Your featured placement on the homepage will expire in 3 days. Renew now to maintain your competitive visibility.`
      : `Your tool is now being featured to thousands of visitors on the Parlexa homepage. Track your performance in the analytics dashboard.`}</p>
    <a href="https://parlexa.in/vendor/billing" class="button">${expiring ? 'Renew Promotion' : 'View Analytics'}</a>
  `),

  // 11. Password reset
  passwordReset: (resetUrl: string) => baseLayout(`
    <h1>Reset your password</h1>
    <p>We received a request to reset your Parlexa account password. Click the button below to choose a new one.</p>
    <a href="${resetUrl}" class="button">Reset Password</a>
    <p style="font-size: 14px; color: ${MUTED_COLOR}; margin-top: 24px;">If you didn't request this change, you can safely ignore this email.</p>
  `),

  // 12. Weekly Digest
  weeklyDigest: (name: string, tools: { name: string, category: string, slug: string }[], unsubscribeLink: string) => baseLayout(`
    <h1>Weekly AI Insights for ${name}</h1>
    <p>Discover the latest specialized AI tools added to the categories you follow.</p>
    <div style="margin: 24px 0;">
      ${tools.map(t => `
        <div style="padding: 16px; border-bottom: 1px solid #f1f5f9;">
          <h3 style="margin: 0; font-size: 16px;">${t.name}</h3>
          <p style="margin: 4px 0 0; font-size: 13px; color: ${MUTED_COLOR};">${t.category}</p>
          <a href="https://parlexa.in/products/${t.slug}" style="font-size: 12px; color: ${ACCENT_COLOR}; font-weight: 600;">Learn More →</a>
        </div>
      `).join('')}
    </div>
    <a href="https://parlexa.in/products" class="button">See All New Tools</a>
  `, unsubscribeLink),

  // 13. Saved tool verified
  savedToolVerified: (toolName: string, slug: string, unsubscribeLink: string) => baseLayout(`
    <div class="pill" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">Verification Alert</div>
    <h1>Great news! ${toolName} is now verified.</h1>
    <p>A tool you saved in your shortlisted evaluations, <strong>${toolName}</strong>, has just completed our formal verification process.</p>
    <p>This signals higher reliability and enterprise-readiness. It might be the perfect time to give it another look.</p>
    <a href="https://parlexa.in/products/${slug}" class="button">View Tool Details</a>
  `, unsubscribeLink),

  // 14. India AI Space Newsletter
  monthlyNewsletter: (unsubscribeLink: string) => baseLayout(`
    <h1>Parlexa Global Monthly: The AI Evolution</h1>
    <p>Welcome to our monthly wrap-up of the global AI agent ecosystem. This month, we've seen a massive surge in specialized agents for legal and supply chain automation.</p>
    <p><strong>Top Highlights:</strong></p>
    <ul>
      <li>15 new verified agents added to the marketplace.</li>
      <li>New "Enterprise Comparison" feature goes live.</li>
      <li>Spotlight on 3 standout tools scaling global operations.</li>
    </ul>
    <a href="https://parlexa.in" class="button">Visit the Marketplace</a>
  `, unsubscribeLink),

  // 15. Claim Verification Email
  claimVerification: (toolName: string, verifyUrl: string) => baseLayout(`
    <div class="pill" style="background: rgba(21, 101, 192, 0.1); color: ${ACCENT_COLOR};">Ownership Verification</div>
    <h1>Verify your claim for ${toolName}</h1>
    <p>A request has been made to claim ownership of the listing for <strong>${toolName}</strong> on Parlexa. To ensure security, we need to verify that you represent this tool.</p>
    <p>Please click the button below to verify your work email address and proceed with the claim.</p>
    <a href="${verifyUrl}" class="button">Verify Email & Claim Listing</a>
    <p style="font-size: 14px; color: ${MUTED_COLOR}; margin-top: 24px;">This link will expire in 24 hours. If you didn't initiate this claim, you can safely ignore this email.</p>
  `),

  // 16. Claim Approved
  claimApproved: (toolName: string) => baseLayout(`
    <div class="pill" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">Claim Approved</div>
    <h1>You are now the owner of ${toolName}!</h1>
    <p>Great news! Your claim for <strong>${toolName}</strong> has been approved. You now have full administrative access to manage this listing on Parlexa.</p>
    <p><strong>What you can do now:</strong></p>
    <ul>
      <li>Update tool descriptions, logos, and screenshots</li>
      <li>Respond directly to customer reviews</li>
      <li>Access deep performance analytics in the vendor portal</li>
    </ul>
    <a href="https://parlexa.in/vendor/listings" class="button">Manage Your Listing</a>
  `),

  // 17. Claim Disputed
  claimDisputed: (toolName: string) => baseLayout(`
    <div class="pill" style="background: rgba(245, 158, 11, 0.1); color: #fb923c;">Claim Contested</div>
    <h1>Security Update: Multiple claims for ${toolName}</h1>
    <p>We have received multiple ownership claims for the listing <strong>${toolName}</strong>.</p>
    <p>Due to our security policies, this listing is now under <strong>Manual Dispute Review</strong>. Our administrative team will verify the credentials of all claimants to determine the rightful owner.</p>
    <p>Our team may reach out to you directly for additional proof of ownership.</p>
    <div style="background: #fffcf0; border-left: 4px solid #fb923c; padding: 16px; margin: 20px 0; color: #9a3412;">
      Status: Under Dispute Review
    </div>
  `),
};
