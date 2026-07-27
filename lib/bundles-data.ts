export interface JourneyRoleDefinition {
  role_name: string;
  role_description: string;
  role_order: number;
  agent_id: number;
  what_it_does: string;
  why_in_step: string;
}

export interface JourneyBundleDefinition {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  type: 'journey' | 'department';
  headline: string;
  benefits: string[];
  use_case: string;
  who_needs_it: string[];
  bundle_icon_url?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  roles: JourneyRoleDefinition[];
}

export const SEED_JOURNEY_BUNDLES: JourneyBundleDefinition[] = [
  {
    id: 1,
    slug: 'd2c-kit',
    name: 'D2C Kit',
    tagline: 'Scale your D2C brand from product discovery to repeat orders',
    description: 'A complete 5-step journey for D2C brands to attract shoppers, boost conversions, close checkout deals, drive repeat purchases, and analyze catalog ROI.',
    category: 'Retail & E-Commerce',
    type: 'journey',
    headline: 'Increase AOV by 35%, reduce cart abandonment by 50%',
    benefits: [
      'Visual search & personalized recommendations boost order values',
      'Automated WhatsApp commerce bots recover abandoned carts instantly',
      'Post-purchase loyalty bots drive 2.5x higher repeat customer rate'
    ],
    use_case: 'D2C brand growth, e-commerce store personalization, and catalog optimization',
    who_needs_it: ['D2C Brand Founders', 'E-Commerce Directors', 'Digital Merchandisers'],
    is_featured: true,
    is_active: true,
    display_order: 1,
    roles: [
      { role_name: 'Awareness', role_description: 'Gets audience attention before purchase', role_order: 1, agent_id: 3, what_it_does: 'Creates visual search and smart product recommendations on your storefront.', why_in_step: 'Attracts shoppers instantly and gets them browsing your product catalog.' },
      { role_name: 'Conversion', role_description: 'Turns website visitors into buyers', role_order: 2, agent_id: 18, what_it_does: 'Predicts shopper demand trends and balances real-time store inventory.', why_in_step: 'Ensures bestsellers are always in stock so visitors buy instead of leaving.' },
      { role_name: 'Closing', role_description: 'Drives cart completion & deal checkout', role_order: 3, agent_id: 22, what_it_does: 'Sends WhatsApp checkout deals and reminders for abandoned carts.', why_in_step: 'Recovers lost shoppers and turns cart drop-offs into completed sales.' },
      { role_name: 'Retention', role_description: 'Engages customers post-purchase', role_order: 4, agent_id: 62, what_it_does: 'Sends back-in-stock notifications and manages buyer wishlists.', why_in_step: 'Brings past buyers back to your store for repeat orders.' },
      { role_name: 'Measurement', role_description: 'Tracks revenue telemetry and analytics', role_order: 5, agent_id: 57, what_it_does: 'Analyzes customer reviews and feedback ratings in real time.', why_in_step: 'Shows you which products to restock and which to improve.' }
    ]
  },
  {
    id: 2,
    slug: 'startup-launch-kit',
    name: 'Startup Launch Kit',
    tagline: 'Validate your idea, build your MVP, and acquire your first 1,000 users',
    description: 'The end-to-end founder stack to validate market demand, build low-code prototypes, execute go-to-market outreach, scale growth, and monitor telemetry.',
    category: 'Enterprise & Automation',
    type: 'journey',
    headline: 'Go from idea to first 1,000 active users 3x faster',
    benefits: [
      'Validate customer demand prior to writing production code',
      'Convert design prototypes directly into React & mobile apps',
      'Automated outreach engine populates your early user waitlist'
    ],
    use_case: 'Early-stage startup building, MVP prototyping, and rapid market launch',
    who_needs_it: ['Startup Founders', 'Solo Entrepreneurs', 'Product Leads'],
    is_featured: true,
    is_active: true,
    display_order: 2,
    roles: [
      { role_name: 'Idea Validation', role_description: 'Validates market demand and customer pain points', role_order: 1, agent_id: 88, what_it_does: 'Collects customer survey feedback and analyzes market demand signals.', why_in_step: 'Proves people want your product before you write production code.' },
      { role_name: 'MVP Building', role_description: 'Accelerates product development and low-code prototyping', role_order: 2, agent_id: 74, what_it_does: 'Converts Figma design mockups directly into functional web app code.', why_in_step: 'Cuts development time by 60% so you build your MVP fast.' },
      { role_name: 'Go-to-Market', role_description: 'Launches marketing campaigns and initial user outreach', role_order: 3, agent_id: 51, what_it_does: 'Automates email and social outreach to build an early waitlist.', why_in_step: 'Fills your signup queue with interested users before launch day.' },
      { role_name: 'Growth', role_description: 'Scales user acquisition and referral channels', role_order: 4, agent_id: 50, what_it_does: 'Scores visitor intent and tracks referral signups automatically.', why_in_step: 'Prioritizes your hottest leads so you convert users faster.' },
      { role_name: 'Analytics', role_description: 'Measures core product metrics and retention telemetry', role_order: 5, agent_id: 6, what_it_does: 'Connects your user data streams into one real-time dashboard.', why_in_step: 'Shows daily active user trends so you know if your product is sticking.' }
    ]
  },
  {
    id: 3,
    slug: 'service-business-kit',
    name: 'Service Business Kit',
    tagline: 'Acquire clients, automate discovery calls, deliver work, and collect payments',
    description: 'Designed for agencies, consultants, and service providers to automate lead capture, discovery call booking, service delivery, billing, and client retention.',
    category: 'Enterprise & Automation',
    type: 'journey',
    headline: 'Automate 80% of agency operations and double client capacity',
    benefits: [
      'Capture qualified client inquiries 24/7 without manual triage',
      'Automated calendar scheduling eliminates back-and-forth emails',
      'RPA bots automate monthly billing, invoicing, and contract sync'
    ],
    use_case: 'Agency operations automation, client onboarding, and automated billing',
    who_needs_it: ['Agency Owners', 'Independent Consultants', 'Professional Service Leads'],
    is_featured: true,
    is_active: true,
    display_order: 3,
    roles: [
      { role_name: 'Client Acquisition', role_description: 'Generates qualified service leads', role_order: 1, agent_id: 51, what_it_does: 'Captures inquiry forms and triages prospective client requests 24/7.', why_in_step: 'Ensures no high-value client inquiry goes unanswered.' },
      { role_name: 'Proposals & Scheduling', role_description: 'Coordinates discovery calls and project proposals', role_order: 2, agent_id: 91, what_it_does: 'Schedules discovery calls and generates meeting summaries automatically.', why_in_step: 'Eliminates back-and-forth emails to lock in client calls.' },
      { role_name: 'Service Delivery', role_description: 'Automates task execution and client workflows', role_order: 3, agent_id: 49, what_it_does: 'Guides clients through project onboarding and step-by-step checklists.', why_in_step: 'Keeps client projects running smoothly without manual handholding.' },
      { role_name: 'Invoicing & Payments', role_description: 'Manages billing, invoicing, and collections', role_order: 4, agent_id: 52, what_it_does: 'Automates monthly client billing, invoice generation, and syncs.', why_in_step: 'Collects payments on time so you maintain healthy cash flow.' },
      { role_name: 'Client Retention', role_description: 'Nurtures long-term client relationships and renewals', role_order: 5, agent_id: 44, what_it_does: 'Tracks client health scores and flags upcoming contract renewal dates.', why_in_step: 'Alerts you to follow up with happy clients to secure retainers.' }
    ]
  },
  {
    id: 4,
    slug: 'creator-economy-kit',
    name: 'Creator Economy Kit',
    tagline: 'Create content, grow your audience, manage your community, and monetize',
    description: 'An integrated suite for creators, newsletter authors, and educators to auto-generate content, expand social reach, manage fan communities, and drive digital sales.',
    category: 'Marketing & Sales',
    type: 'journey',
    headline: 'Grow audience 5x faster, monetize directly with AI tools',
    benefits: [
      'Generate high-converting video scripts, newsletter copy, and visual posts',
      'Multilingual AI voice translation expands your content globally',
      'Automated community bots convert social followers into paid subscribers'
    ],
    use_case: 'Content creation, social media growth, and digital product monetization',
    who_needs_it: ['Content Creators', 'Newsletter Publishers', 'Digital Educators'],
    is_featured: false,
    is_active: true,
    display_order: 4,
    roles: [
      { role_name: 'Content Creation', role_description: 'Generates videos, copy, and visual assets', role_order: 1, agent_id: 40, what_it_does: 'Generates newsletter copy, social posts, and video scripts in seconds.', why_in_step: 'Keeps your content pipeline full without writer block.' },
      { role_name: 'Audience Growth', role_description: 'Expands distribution and social media reach', role_order: 2, agent_id: 23, what_it_does: 'Translates your videos and podcasts into multiple global languages.', why_in_step: 'Expands your reach to international audiences effortlessly.' },
      { role_name: 'Community Management', role_description: 'Engages subscribers and manages fan interactions', role_order: 3, agent_id: 9, what_it_does: 'Handles subscriber questions and DM replies across all channels.', why_in_step: 'Builds deep fan engagement without drowning in messages.' },
      { role_name: 'Monetization', role_description: 'Drives digital product and sponsorship revenue', role_order: 4, agent_id: 22, what_it_does: 'Sells digital downloads, courses, and memberships directly in chat.', why_in_step: 'Turns social followers into paying customers on autopilot.' },
      { role_name: 'Analytics', role_description: 'Tracks content engagement and earnings analytics', role_order: 5, agent_id: 56, what_it_does: 'Monitors content performance metrics and earnings telemetry.', why_in_step: 'Shows which posts generate the highest revenue so you post more of them.' }
    ]
  },
  {
    id: 5,
    slug: 'b2b-saas-kit',
    name: 'B2B SaaS Kit',
    tagline: 'Capture intent, run automated demos, onboard accounts, and reduce churn',
    description: 'The revenue and customer success engine for B2B software companies to capture sales leads, automate product demos, streamline user onboarding, and prevent churn.',
    category: 'Developer Tools & Infra',
    type: 'journey',
    headline: '3x B2B pipeline velocity, reduce churn by 40%',
    benefits: [
      'Capture buyer intent signals and route leads to sales reps instantly',
      'Automated interactive product demos guide buyers through setup',
      'Product telemetry alerts customer success reps prior to contract renewal'
    ],
    use_case: 'B2B sales automation, user onboarding, and customer success management',
    who_needs_it: ['VP of Sales', 'Head of Customer Success', 'SaaS Growth Leaders'],
    is_featured: true,
    is_active: true,
    display_order: 5,
    roles: [
      { role_name: 'Lead Generation', role_description: 'Captures high-intent B2B prospects', role_order: 1, agent_id: 51, what_it_does: 'Captures inbound B2B software leads and enriches company profiles.', why_in_step: 'Delivers qualified sales prospects directly to your reps.' },
      { role_name: 'Demo & Sales', role_description: 'Automates sales demos and pipeline movement', role_order: 2, agent_id: 91, what_it_does: 'Runs automated product walkthroughs and records buyer feedback.', why_in_step: 'Moves prospects from demo request to sales proposal 2x faster.' },
      { role_name: 'Onboarding', role_description: 'Guides new accounts through setup and adoption', role_order: 3, agent_id: 49, what_it_does: 'Guides new workspace users through product setup and key feature adoption.', why_in_step: 'Helps users reach their first aha moment fast to stop early drop-offs.' },
      { role_name: 'Customer Success', role_description: 'Monitors account health and prevents churn', role_order: 4, agent_id: 13, what_it_does: 'Monitors customer account health and detects software usage drops.', why_in_step: 'Alerts success reps early so you prevent subscription churn.' },
      { role_name: 'Product Analytics', role_description: 'Tracks feature usage and telemetry', role_order: 5, agent_id: 56, what_it_does: 'Tracks feature adoption telemetry and API response latency.', why_in_step: 'Gives product teams clear data on which features drive expansion.' }
    ]
  },
  {
    id: 6,
    slug: 'hr-hiring-kit',
    name: 'HR Hiring Kit',
    tagline: 'Hire 10x faster — from candidate sourcing to offer acceptance',
    description: 'A 5-step departmental stack that sources talent, screens resumes, coordinates panel interviews, auto-generates offer letters, and automates onboarding.',
    category: 'HR & Workforce',
    type: 'department',
    headline: 'Reduce time-to-hire from 45 to 15 days',
    benefits: [
      'Screen 1,000+ applicants in minutes with unbiased resume parsing',
      'Automate candidate interview scheduling across calendar availability',
      'Improve offer acceptance rate through streamlined onboarding'
    ],
    use_case: 'Talent recruitment automation, applicant screening, and candidate onboarding',
    who_needs_it: ['CHROs', 'Head of Talent Acquisition', 'HR Operations Leads'],
    is_featured: false,
    is_active: true,
    display_order: 6,
    roles: [
      { role_name: 'Sourcing', role_description: 'Discovers candidate profiles across channels', role_order: 1, agent_id: 25, what_it_does: 'Scours tech job boards and databases to discover talent profiles.', why_in_step: 'Builds a deep pipeline of qualified candidates for open roles.' },
      { role_name: 'Screening', role_description: 'Evaluates resume fit and qualifications', role_order: 2, agent_id: 46, what_it_does: 'Parses resumes and scores candidate fit against job specs.', why_in_step: 'Filters out unqualified applicants in minutes instead of hours.' },
      { role_name: 'Interviewing', role_description: 'Coordinates panel interviews and feedback', role_order: 3, agent_id: 35, what_it_does: 'Coordinates multi-interviewer schedules and collects feedback forms.', why_in_step: 'Saves hours of scheduling back-and-forth with candidates.' },
      { role_name: 'Hiring & Offer', role_description: 'Generates offer packages and compliance docs', role_order: 4, agent_id: 47, what_it_does: 'Generates custom offer letters and manages digital sign-offs.', why_in_step: 'Secures top candidate acceptances before competing offers arrive.' },
      { role_name: 'Onboarding', role_description: 'Integrates new hires into team workflows', role_order: 5, agent_id: 52, what_it_does: 'Automates new hire IT setup, doc collection, and orientation tasks.', why_in_step: 'Gets new employees productive on Day 1 without HR stress.' }
    ]
  },
  {
    id: 7,
    slug: 'sales-prospecting-to-closing-kit',
    name: 'Sales Prospecting-to-Closing Kit',
    tagline: 'Grow pipeline 3x, qualify intent, and close enterprise deals 2x faster',
    description: 'Departmental sales execution suite covering account prospecting, buyer qualification, hyper-personalized outreach, contract closing, and account retention.',
    category: 'Marketing & Sales',
    type: 'department',
    headline: 'Grow pipeline 3x, close enterprise deals 2x faster',
    benefits: [
      'Real-time intent lead scoring prioritizes high-value prospects',
      'Hyper-personalized copywriting engine boosts cold open rates',
      'Automated sales assistants schedule demos and track deal telemetry'
    ],
    use_case: 'Outbound sales acceleration, lead qualification, and deal closing',
    who_needs_it: ['VP of Sales', 'Sales Development Managers', 'Account Executives'],
    is_featured: true,
    is_active: true,
    display_order: 7,
    roles: [
      { role_name: 'Prospecting', role_description: 'Identifies high-value enterprise decision makers', role_order: 1, agent_id: 50, what_it_does: 'Identifies target decision makers and tracks company intent signals.', why_in_step: 'Finds companies actively searching for software like yours.' },
      { role_name: 'Qualification', role_description: 'Scores buyer intent and readiness', role_order: 2, agent_id: 65, what_it_does: 'Evaluates prospect budget, company size, and buying readiness.', why_in_step: 'Focuses your reps only on deals that are ready to buy.' },
      { role_name: 'Outreach', role_description: 'Delivers personalized multi-channel outreach', role_order: 3, agent_id: 40, what_it_does: 'Writes personalized multi-touch email sequences for target accounts.', why_in_step: 'Doubles email response rates with tailored messaging.' },
      { role_name: 'Closing', role_description: 'Manages contract negotiation and deal execution', role_order: 4, agent_id: 91, what_it_does: 'Schedules contract review calls and tracks deal milestone progress.', why_in_step: 'Removes deal friction to close enterprise contracts faster.' },
      { role_name: 'Account Management', role_description: 'Expands accounts and drives upsells', role_order: 5, agent_id: 44, what_it_does: 'Tracks account satisfaction and identifies upsell opportunities.', why_in_step: 'Grows existing customer accounts and secures annual renewals.' }
    ]
  },
  {
    id: 8,
    slug: 'fintech-and-compliance-kit',
    name: 'FinTech & Compliance Kit',
    tagline: 'Verify user identities, score transaction risk, process payments, and block fraud',
    description: 'A 5-step financial operational journey to automate user KYC, calculate real-time transaction risk, process payments, detect fraud, and maintain audit reports.',
    category: 'FinTech',
    type: 'journey',
    headline: 'Process payments 100% securely, stop fraud before it happens',
    benefits: [
      'Automated KYC identity checks onboard users in under 30 seconds',
      'Real-time transaction risk scoring blocks fraudulent chargebacks',
      'Automated compliance reporting keeps your platform audit-ready'
    ],
    use_case: 'Financial user onboarding, fraud prevention, payment processing, and audit compliance',
    who_needs_it: ['Chief Compliance Officers', 'FinTech Founders', 'Risk & Operations Directors'],
    is_featured: true,
    is_active: true,
    display_order: 8,
    roles: [
      { role_name: 'KYC Verification', role_description: 'Verifies user identity docs and background compliance', role_order: 1, agent_id: 65, what_it_does: 'Verifies user identity docs and performs background compliance checks.', why_in_step: 'Onboards legitimate financial users while stopping fraud at the door.' },
      { role_name: 'Risk Scoring', role_description: 'Calculates real-time credit and transaction risk scores', role_order: 2, agent_id: 50, what_it_does: 'Calculates real-time credit and transaction risk scores.', why_in_step: 'Prevents high-risk transactions before they process.' },
      { role_name: 'Payment Processing', role_description: 'Automates multi-currency payment settlement and billing', role_order: 3, agent_id: 52, what_it_does: 'Automates multi-currency payment settlement and invoice syncs.', why_in_step: 'Ensures fast, reliable payment collection across global gateways.' },
      { role_name: 'Fraud Detection', role_description: 'Monitors transaction patterns for anomalies and suspicious activity', role_order: 4, agent_id: 13, what_it_does: 'Monitors transaction patterns for anomalies and suspicious activity.', why_in_step: 'Flags fraud attempts instantly to protect your balance sheet.' },
      { role_name: 'Audit Compliance', role_description: 'Generates automated audit trails and regulatory reports', role_order: 5, agent_id: 6, what_it_does: 'Generates automated audit trails and regulatory compliance reports.', why_in_step: 'Keeps your financial operations 100% audit-ready at all times.' }
    ]
  },
  {
    id: 9,
    slug: 'healthcare-and-clinical-care-kit',
    name: 'Healthcare & Clinical Care Kit',
    tagline: 'Book patient visits, transcribe clinical notes, triage symptoms, and process billing',
    description: 'Designed for medical clinics and healthcare providers to streamline patient scheduling, EHR clinical note transcription, symptom triage, and medical billing.',
    category: 'Healthcare',
    type: 'journey',
    headline: 'Save doctors 2+ hours daily on documentation, cut no-shows by 50%',
    benefits: [
      'Automated patient appointment reminders eliminate missed visits',
      'AI clinical dictation transcribes doctor consultations directly into notes',
      'Symptom triage bot routes urgent patient needs to care staff fast'
    ],
    use_case: 'Clinic operational automation, patient appointment management, and EHR note transcription',
    who_needs_it: ['Clinic Administrators', 'Medical Directors', 'Healthcare Operations Managers'],
    is_featured: false,
    is_active: true,
    display_order: 9,
    roles: [
      { role_name: 'Appointment Booking', role_description: 'Automates patient visit scheduling and calendar reminders', role_order: 1, agent_id: 91, what_it_does: 'Automates patient visit booking and calendar reminders 24/7.', why_in_step: 'Reduces patient no-shows and fills open appointment slots.' },
      { role_name: 'Clinical Notes', role_description: 'Transcribes doctor-patient consultations into medical notes', role_order: 2, agent_id: 40, what_it_does: 'Transcribes doctor-patient consultations into structured medical notes.', why_in_step: 'Saves physicians 2+ hours daily on manual EHR documentation.' },
      { role_name: 'Patient Triage', role_description: 'Asks symptom questions and routes urgent cases to care staff', role_order: 3, agent_id: 9, what_it_does: 'Asks preliminary symptom questions and routes urgent cases to care staff.', why_in_step: 'Prioritizes critical patient needs before they enter the clinic.' },
      { role_name: 'Medical Billing', role_description: 'Parses medical billing codes and processes insurance claims', role_order: 4, agent_id: 52, what_it_does: 'Parses medical billing codes and processes insurance claims.', why_in_step: 'Cuts claim rejection rates and speeds up clinic reimbursements.' },
      { role_name: 'Follow-Up Engagement', role_description: 'Sends prescription refill reminders and post-care checkups', role_order: 5, agent_id: 62, what_it_does: 'Sends prescription refill reminders and post-care health checkups.', why_in_step: 'Improves patient recovery outcomes and long-term retention.' }
    ]
  },
  {
    id: 10,
    slug: 'edtech-and-course-creator-kit',
    name: 'EdTech & Course Creator Kit',
    tagline: 'Enroll students, generate lesson plans, run quizzes, grade, and track progress',
    description: 'An all-in-one educational stack to automate student enrollment, lesson content generation, automated quiz creation, instant grading, and retention tracking.',
    category: 'EdTech',
    type: 'journey',
    headline: 'Launch courses 5x faster, boost student completion rates to 70%',
    benefits: [
      'Generate lesson plans, video scripts, and quizzes in minutes',
      'Instant AI grading gives students immediate feedback on assignments',
      'Automated retention alerts re-engage struggling students before they drop out'
    ],
    use_case: 'Online course creation, automated student grading, and learning retention management',
    who_needs_it: ['Online Educators', 'EdTech Founders', 'Corporate Training Directors'],
    is_featured: true,
    is_active: true,
    display_order: 10,
    roles: [
      { role_name: 'Student Enrollment', role_description: 'Captures student signups and processes course enrollments', role_order: 1, agent_id: 51, what_it_does: 'Captures student signups and processes course enrollments automatically.', why_in_step: 'Fills course cohorts without manual admin overhead.' },
      { role_name: 'Course Content Gen', role_description: 'Generates lesson outlines, video scripts, and reading materials', role_order: 2, agent_id: 40, what_it_does: 'Generates lesson outlines, video scripts, and reading materials.', why_in_step: 'Cuts course creation time from months down to days.' },
      { role_name: 'Assessments & Quizzes', role_description: 'Builds interactive quizzes and practice exams tailored to lessons', role_order: 3, agent_id: 88, what_it_does: 'Builds interactive quizzes and practice exams tailored to lessons.', why_in_step: 'Tests student understanding at every step of the course.' },
      { role_name: 'Grading & Feedback', role_description: 'Grades student assignments and provides instant feedback tips', role_order: 4, agent_id: 46, what_it_does: 'Grades student assignments and provides instant feedback tips.', why_in_step: 'Gives students immediate guidance while freeing up instructor time.' },
      { role_name: 'Student Retention', role_description: 'Monitors student progress and sends encouragement to learners', role_order: 5, agent_id: 44, what_it_does: 'Monitors student progress and sends encouragement to struggling learners.', why_in_step: 'Boosts course completion rates from 15% up to 70%.' }
    ]
  }
];
