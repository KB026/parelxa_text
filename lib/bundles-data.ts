export interface BundleToolDefinition {
  agent_id: number;
  position: number;
  role_in_workflow: string;
  reason: string;
}

export interface BundleDefinition {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  headline: string;
  benefits: string[];
  use_case: string;
  who_needs_it: string[];
  bundle_icon_url?: string;
  cover_image_url?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  tools: BundleToolDefinition[];
}

export const SEED_BUNDLES: BundleDefinition[] = [
  {
    id: 1,
    slug: 'ai-and-llms',
    name: 'AI & LLMs',
    tagline: 'Deploy enterprise-grade AI, not just ChatGPT',
    description: 'A complete enterprise stack for fine-tuning, deploying, vector querying, and monitoring foundational LLMs with private data governance and compliance.',
    category: 'AI & LLMs',
    headline: 'Deploy enterprise-grade AI, not just ChatGPT',
    benefits: [
      'Reduce model latency by up to 65% with custom vector indexing',
      'Ensure zero data leakage with enterprise privacy boundaries',
      'Unified telemetry and performance monitoring across multi-LLM workflows'
    ],
    use_case: 'Building custom enterprise copilots and domain-specific LLM workflows',
    who_needs_it: ['CTOs & Chief AI Officers', 'Enterprise Architects', 'ML Engineering Teams'],
    is_featured: true,
    is_active: true,
    display_order: 1,
    tools: [
      { agent_id: 94, position: 1, role_in_workflow: 'Foundational LLM Engine', reason: 'Provides localized LLM capability trained for high enterprise accuracy.' },
      { agent_id: 48, position: 2, role_in_workflow: 'Orchestration Framework', reason: 'Automates complex multi-agent workflows, prompting pipelines, and external API calls.' },
      { agent_id: 31, position: 3, role_in_workflow: 'Vector Indexing & Retrieval', reason: 'High-speed vector database for real-time RAG applications and doc search.' },
      { agent_id: 59, position: 4, role_in_workflow: 'Automated Evaluation & Testing', reason: 'Ensures robust regression testing, hallucination detection, and prompt verification.' },
      { agent_id: 56, position: 5, role_in_workflow: 'Enterprise Observability', reason: 'Monitors inference cost, response accuracy, and latency across deployed models.' }
    ]
  },
  {
    id: 2,
    slug: 'customer-experience',
    name: 'Customer Experience',
    tagline: 'Reduce support costs by 60%, improve CSAT by 40%',
    description: 'Transform customer support into a 24/7 autonomous resolution engine with real-time sentiment analysis, multi-channel routing, and feedback analysis.',
    category: 'Customer Experience',
    headline: 'Reduce support costs by 60%, improve CSAT by 40%',
    benefits: [
      'Automate up to 80% of repetitive Tier-1 customer queries',
      'Instant voice & text chat response in over 15 regional languages',
      'Real-time sentiment scoring triggers seamless human agent handoff'
    ],
    use_case: 'Omnichannel customer support automation for scale-ups and enterprises',
    who_needs_it: ['VP of Customer Experience', 'Support Operations Leads', 'Customer Success Managers'],
    is_featured: true,
    is_active: true,
    display_order: 2,
    tools: [
      { agent_id: 9, position: 1, role_in_workflow: 'AI Conversational Bot', reason: 'Handles multi-turn support conversations across web, WhatsApp, and app.' },
      { agent_id: 11, position: 2, role_in_workflow: 'Sentiment & Voice Analytics', reason: 'Analyzes tone, agent behavior, and customer satisfaction during interactions.' },
      { agent_id: 95, position: 3, role_in_workflow: 'Multi-Channel Integration Gateway', reason: 'Routes incoming tickets across Zendesk, Salesforce, and email seamlessly.' },
      { agent_id: 13, position: 4, role_in_workflow: 'Feedback & QA Analyzer', reason: 'Automatically grades support interactions and flags compliance violations.' }
    ]
  },
  {
    id: 3,
    slug: 'marketing-and-sales',
    name: 'Marketing & Sales',
    tagline: 'Grow pipeline 3x, close deals 2x faster',
    description: 'An integrated revenue engine that automates prospect outreach, lead scoring, email copywriting, meeting scheduling, and CRM integration.',
    category: 'Marketing & Sales',
    headline: 'Grow pipeline 3x, close deals 2x faster',
    benefits: [
      '3x increase in qualified sales pipeline through automated outreach',
      'Real-time intent lead scoring prioritizes high-value prospects',
      'Seamless calendar scheduling and CRM record sync'
    ],
    use_case: 'Outbound sales automation and inbound lead conversion optimization',
    who_needs_it: ['Head of Growth', 'VP of Sales', 'Demand Generation Managers'],
    is_featured: true,
    is_active: true,
    display_order: 3,
    tools: [
      { agent_id: 51, position: 1, role_in_workflow: 'Automated Outreach Engine', reason: 'Captures and manages prospect journeys with high email deliverability.' },
      { agent_id: 50, position: 2, role_in_workflow: 'Intent Lead Scoring', reason: 'Scores lead engagement and buyer readiness in real time.' },
      { agent_id: 40, position: 3, role_in_workflow: 'AI Email Copywriting', reason: 'Generates tailored email copy and landing page text at enterprise scale.' },
      { agent_id: 91, position: 4, role_in_workflow: 'Meeting Scheduler', reason: 'Schedules sales demos and records meeting telemetry automatically.' },
      { agent_id: 44, position: 5, role_in_workflow: 'CRM Integration & Analytics', reason: 'Tracks lead conversion funnels and synchronizes CRM data streams.' }
    ]
  },
  {
    id: 4,
    slug: 'enterprise-and-automation',
    name: 'Enterprise & Automation',
    tagline: 'Automate 80% of manual processes',
    description: 'Eliminate repetitive manual data entry, unstructured document ingestion, and fragmented data pipelines with an integrated no-code RPA & process intelligence stack.',
    category: 'Enterprise & Automation',
    headline: 'Automate 80% of manual processes',
    benefits: [
      'Eliminate 95%+ of manual invoice and document processing errors',
      'Connect legacy enterprise databases with modern API workflows',
      'Continuous process intelligence discovers operational bottlenecks'
    ],
    use_case: 'Enterprise process automation, invoice processing, and back-office efficiency',
    who_needs_it: ['Chief Operating Officers', 'Digital Transformation Directors', 'Process Automation Leads'],
    is_featured: false,
    is_active: true,
    display_order: 4,
    tools: [
      { agent_id: 49, position: 1, role_in_workflow: 'No-Code Automation Platform', reason: 'Guides users through complex software tasks and automates workflow steps.' },
      { agent_id: 53, position: 2, role_in_workflow: 'Document Processing & Extraction', reason: 'Parses PDFs, scanned receipts, and unstructured contracts automatically.' },
      { agent_id: 6, position: 3, role_in_workflow: 'Enterprise Data Pipeline', reason: 'Synthesizes cross-department data streams into real-time operational insights.' },
      { agent_id: 52, position: 4, role_in_workflow: 'RPA Bot Assistant', reason: 'Executes scheduled back-office tasks, data syncs, and system updates.' }
    ]
  },
  {
    id: 5,
    slug: 'hr-and-workforce',
    name: 'HR & Workforce',
    tagline: 'Hire 10x faster, reduce time-to-hire from 45 to 15 days',
    description: 'End-to-end talent acquisition stack that sources candidates, scores resumes, coordinates interviews, runs assessments, and auto-generates offer packages.',
    category: 'HR & Workforce',
    headline: 'Hire 10x faster, reduce time-to-hire from 45 to 15 days',
    benefits: [
      'Screen 1,000+ applicants in minutes with unbiased resume parsing',
      'Automate candidate interview scheduling across calendar availability',
      'Improve offer acceptance rate through streamlined candidate experience'
    ],
    use_case: 'Full-lifecycle automated talent recruitment and employee onboarding',
    who_needs_it: ['Chief Human Resources Officers', 'Head of Talent Acquisition', 'HR Operations Leads'],
    is_featured: false,
    is_active: true,
    display_order: 5,
    tools: [
      { agent_id: 25, position: 1, role_in_workflow: 'Candidate Outreach Sourcing', reason: 'Scours talent marketplaces to source best-fit candidate profiles.' },
      { agent_id: 46, position: 2, role_in_workflow: 'AI Resume Scorer', reason: 'Evaluates applicant fit and tracks talent through hiring stages.' },
      { agent_id: 35, position: 3, role_in_workflow: 'Interview Scheduler', reason: 'Coordinates multi-stage panel interviews and collects reviewer feedback.' },
      { agent_id: 64, position: 4, role_in_workflow: 'Assessment & Engagement', reason: 'Measures candidate sentiment, culture fit, and skill readiness.' },
      { agent_id: 47, position: 5, role_in_workflow: 'Offer Package Generator', reason: 'Generates compliant offer letters and triggers onboarding document workflows.' }
    ]
  },
  {
    id: 6,
    slug: 'healthcare',
    name: 'Healthcare',
    tagline: 'Improve patient outcomes, reduce diagnostic time by 50%',
    description: 'Clinical decision support stack integrating medical image analysis, AI patient triage, EHR data synchronization, and evidence-based treatment guidance.',
    category: 'Healthcare',
    headline: 'Improve patient outcomes, reduce diagnostic time by 50%',
    benefits: [
      'Instant radiograph and CT scan triage for urgent abnormalities',
      'Automate patient intake, symptom collection, and appointment booking',
      'HIPAA-compliant EHR data integration and clinical telemetry'
    ],
    use_case: 'Hospital diagnostic acceleration, outpatient triage, and clinical workflow optimization',
    who_needs_it: ['Chief Medical Officers', 'Hospital Administrators', 'Diagnostic Center Directors'],
    is_featured: false,
    is_active: true,
    display_order: 6,
    tools: [
      { agent_id: 8, position: 1, role_in_workflow: 'Medical Imaging AI Engine', reason: 'Detects critical anomalies in chest X-rays, CTs, and scans rapidly.' },
      { agent_id: 38, position: 2, role_in_workflow: 'Patient Triage Chatbot', reason: 'Provides automated patient pre-screening and thermal imaging analysis.' },
      { agent_id: 58, position: 3, role_in_workflow: 'EHR System Integration', reason: 'Syncs patient health records, scheduling, and billing systems.' },
      { agent_id: 15, position: 4, role_in_workflow: 'Treatment Recommendation Engine', reason: 'Analyzes blood smears and diagnostic reports for actionable clinical advice.' }
    ]
  },
  {
    id: 7,
    slug: 'fintech',
    name: 'FinTech',
    tagline: 'Process 1000s daily, prevent fraud, stay compliant',
    description: 'High-throughput financial intelligence stack engineered for real-time transaction fraud detection, automated credit underwriting, AML compliance, and digital onboarding.',
    category: 'FinTech',
    headline: 'Process 1000s daily, prevent fraud, stay compliant',
    benefits: [
      'Sub-100ms fraud detection for high-frequency digital payments',
      'Automated credit scoring utilizing alternative financial datasets',
      'Continuous regulatory compliance monitoring and audit reporting'
    ],
    use_case: 'Digital banking, payment gateway fraud prevention, and credit underwriting',
    who_needs_it: ['Chief Risk Officers', 'Head of Fraud & Compliance', 'FinTech Product Leaders'],
    is_featured: false,
    is_active: true,
    display_order: 7,
    tools: [
      { agent_id: 16, position: 1, role_in_workflow: 'Real-Time Fraud Detection', reason: 'Analyzes transaction signals to block fraudulent activity instantly.' },
      { agent_id: 65, position: 2, role_in_workflow: 'AI Credit Scoring', reason: 'Evaluates creditworthiness using deep financial statement analysis.' },
      { agent_id: 54, position: 3, role_in_workflow: 'Compliance & AML Scanner', reason: 'Monitors external dark web threats, leaks, and regulatory compliance.' },
      { agent_id: 7, position: 4, role_in_workflow: 'Portfolio Optimization Engine', reason: 'Optimizes yield allocations and asset risk balancing continuously.' },
      { agent_id: 32, position: 5, role_in_workflow: 'Customer Onboarding & e-KYC', reason: 'Automates e-KYC, document authentication, and facial verification.' }
    ]
  },
  {
    id: 8,
    slug: 'retail-and-e-commerce',
    name: 'Retail & E-Commerce',
    tagline: 'Increase AOV by 35%, reduce cart abandonment by 50%',
    description: 'Unified retail stack driving personalized product discovery, intelligent dynamic pricing, conversational commerce chatbots, and inventory optimization.',
    category: 'Retail & E-Commerce',
    headline: 'Increase AOV by 35%, reduce cart abandonment by 50%',
    benefits: [
      'Visual search & personalized recommendations boost order values',
      'Automated WhatsApp/Web commerce bots answer buyer questions instantly',
      'Predictive inventory allocation minimizes stock-outs during sales peak'
    ],
    use_case: 'E-commerce store personalization, retention marketing, and inventory forecasting',
    who_needs_it: ['E-Commerce Directors', 'Head of Digital Merchandising', 'D2C Brand Founders'],
    is_featured: true,
    is_active: true,
    display_order: 8,
    tools: [
      { agent_id: 3, position: 1, role_in_workflow: 'Product Recommendation Engine', reason: 'Delivers hyper-personalized visual recommendations on storefronts.' },
      { agent_id: 18, position: 2, role_in_workflow: 'Inventory Optimization', reason: 'Predicts demand trends and keeps inventory levels balanced.' },
      { agent_id: 22, position: 3, role_in_workflow: 'Dynamic Pricing & Commerce Bot', reason: 'Engages shoppers on WhatsApp to recover abandoned carts and share deals.' },
      { agent_id: 62, position: 4, role_in_workflow: 'Customer Service Chatbot', reason: 'Handles post-order tracking queries, returns, and support 24/7.' },
      { agent_id: 57, position: 5, role_in_workflow: 'Review Analysis & Insights', reason: 'Synthesizes shopper reviews to identify catalog improvements.' }
    ]
  },
  {
    id: 9,
    slug: 'developer-tools-and-infra',
    name: 'Developer Tools & Infra',
    tagline: 'Developers write 40% more code, spend 60% less time on boilerplate',
    description: 'Engineering acceleration suite providing automated code generation, zero-code test creation, bug detection, and CI/CD optimization.',
    category: 'Developer Tools & Infra',
    headline: 'Developers write 40% more code, spend 60% less time on boilerplate',
    benefits: [
      'Accelerate feature shipping by automating repetitive test authoring',
      'Instantly detect security vulnerabilities prior to production deployment',
      'Automate API documentation and technical reference generation'
    ],
    use_case: 'Software engineering acceleration, automated QA testing, and DevOps efficiency',
    who_needs_it: ['VP of Engineering', 'DevOps Managers', 'Lead Software Architects'],
    is_featured: false,
    is_active: true,
    display_order: 9,
    tools: [
      { agent_id: 74, position: 1, role_in_workflow: 'AI Code Generation', reason: 'Converts design mockups directly into clean React and Flutter code.' },
      { agent_id: 60, position: 2, role_in_workflow: 'Bug Detection & QA Automation', reason: 'Creates and runs end-to-end test suites without manual script writing.' },
      { agent_id: 83, position: 3, role_in_workflow: 'Documentation Generator', reason: 'Auto-documents API endpoints and interactive workflow logic.' },
      { agent_id: 5, position: 4, role_in_workflow: 'CI/CD Optimization', reason: 'Optimizes cloud compute workloads and speeds up build pipelines.' }
    ]
  },
  {
    id: 10,
    slug: 'logistics-and-supply-chain',
    name: 'Logistics & Supply Chain',
    tagline: 'Reduce delivery costs by 25%, improve on-time delivery to 98%',
    description: 'Smart supply chain intelligence stack designed for dynamic route dispatch, warehouse automation, fleet tracking, and demand forecasting.',
    category: 'Logistics & Supply Chain',
    headline: 'Reduce delivery costs by 25%, improve on-time delivery to 98%',
    benefits: [
      'Dynamic dispatch routing reduces fuel consumption by up to 25%',
      'Real-time last-mile tracking provides exact ETA transparency to customers',
      'Warehouse automation streamlines order picking and dispatch throughput'
    ],
    use_case: 'Fleet dispatch, last-mile delivery tracking, and supply chain forecasting',
    who_needs_it: ['VP of Supply Chain', 'Fleet Operations Directors', 'Logistics Managers'],
    is_featured: false,
    is_active: true,
    display_order: 10,
    tools: [
      { agent_id: 10, position: 1, role_in_workflow: 'Route Optimization Engine', reason: 'Calculates optimal multi-stop routes considering traffic and capacity.' },
      { agent_id: 20, position: 2, role_in_workflow: 'Demand Forecasting & Tracking', reason: 'Provides real-time visibility and predicts regional order spikes.' },
      { agent_id: 17, position: 3, role_in_workflow: 'Warehouse Management System', reason: 'Monitors warehouse machinery and inventory movement automatically.' },
      { agent_id: 21, position: 4, role_in_workflow: 'Last-Mile Tracking Gateway', reason: 'Keeps end-customers informed with live tracking updates and proof of delivery.' }
    ]
  },
  {
    id: 11,
    slug: 'agritech',
    name: 'AgriTech',
    tagline: 'Increase yield by 30%, reduce pesticide costs by 40%',
    description: 'Precision agriculture intelligence stack combining satellite/camera crop health monitoring, localized microclimate prediction, and AI pest control recommendations.',
    category: 'AgriTech',
    headline: 'Increase yield by 30%, reduce pesticide costs by 40%',
    benefits: [
      'Early detection of crop disease through smartphone camera imaging',
      'Precision weather & microclimate forecasting guides irrigation timing',
      'Optimize fertilizer and pesticide usage to lower input expenditure'
    ],
    use_case: 'Precision agriculture, farm yield management, and crop quality assessment',
    who_needs_it: ['Agri-Business Operations Leads', 'Agronomists', 'Farming Co-operative Directors'],
    is_featured: false,
    is_active: true,
    display_order: 11,
    tools: [
      { agent_id: 29, position: 1, role_in_workflow: 'Crop Health Inspection', reason: 'Uses computer vision to assess crop quality and detect early disease.' },
      { agent_id: 75, position: 2, role_in_workflow: 'Weather Prediction Bot', reason: 'Delivers actionable farming advice based on real-time microclimate data.' },
      { agent_id: 19, position: 3, role_in_workflow: 'Yield Optimization Engine', reason: 'Digitizes plot management, seed selection, and harvest yield prediction.' },
      { agent_id: 30, position: 4, role_in_workflow: 'Pest Management Advisor', reason: 'Guides targeted pesticide applications to protect crops and save costs.' }
    ]
  },
  {
    id: 12,
    slug: 'edtech',
    name: 'EdTech',
    tagline: 'Improve student outcomes by 25%, reduce teacher workload by 40%',
    description: 'Comprehensive educational AI suite featuring adaptive learning pathways, automated homework evaluation, predictive student intervention, and content creation.',
    category: 'EdTech',
    headline: 'Improve student outcomes by 25%, reduce teacher workload by 40%',
    benefits: [
      'Adaptive learning paths adjust to individual student comprehension speeds',
      'Automated grading frees educators to focus on 1-on-1 student mentorship',
      'Early risk detection identifies students needing academic intervention'
    ],
    use_case: 'K-12 & Higher Ed adaptive learning, automated grading, and curriculum generation',
    who_needs_it: ['School Principals & Deans', 'EdTech Product Managers', 'Academic Directors'],
    is_featured: false,
    is_active: true,
    display_order: 12,
    tools: [
      { agent_id: 190, position: 1, role_in_workflow: 'Personalized Learning Engine', reason: 'Creates interactive visual study guides and adaptive lesson modules.' },
      { agent_id: 188, position: 2, role_in_workflow: 'Automated Grading System', reason: 'Evaluates written assignments and provides instant feedback to learners.' },
      { agent_id: 36, position: 3, role_in_workflow: 'Student Success Predictor', reason: 'Tracks student progress and flags at-risk learners early.' },
      { agent_id: 33, position: 4, role_in_workflow: 'AI Content Generation', reason: 'Generates quizzes, flashcards, and supplementary course materials automatically.' }
    ]
  }
];
