export interface AgentDB {
  id: number;
  slug: string;
  name: string;
  one_liner?: string;
  logo_url?: string;
  description?: string;
  category: string;
  sub_category?: string;
  summary: string;
  use_cases?: string;
  features?: string[];
  pricing: string;
  pricing_model?: string;
  price_range?: string;
  free_trial?: string;
  global_availability?: boolean;
  usd_price?: string;
  pricing_in_inr?: string;
  indian_origin_status?: boolean;
  integration_type?: string[];
  rating: number;
  reviews: number;
  reviews_count?: number;
  user_id?: string;
  user_email?: string;
  website: string;
  demo_url?: string;
  video_url?: string;
  screenshots?: string[];
  tags?: string[];
  industries?: string[];
  is_verified?: boolean;
  approval_status?: string;
  raw_industry?: string;
  company_name?: string;
  company_gstin?: string;
  contact_name?: string;
  contact_phone?: string;
  team_size?: string;
  company_linkedin?: string;
  company_blurb?: string;
  founders?: string;
  founder_linkedin?: string;
  city?: string;
  founded_year?: number;
  is_pinned_trending?: boolean;
  trending_score?: number;
  is_featured?: boolean;
}

export interface Agent {
  id: number;
  slug: string;
  name: string;
  oneLiner?: string;
  logoUrl?: string;
  description?: string;
  category: string;
  subCategory: string;
  summary: string;
  useCases: string;
  features?: string[];
  pricing: string;
  pricingModel?: string;
  priceRange?: string;
  freeTrial?: string;
  globalAvailability?: boolean;
  usdPrice?: string;
  pricingInInr?: string;
  indianOriginStatus?: boolean;
  integrationType?: string[];
  rating: number;
  reviews: number;
  reviews_count?: number;
  userId?: string;
  userEmail?: string;
  website: string;
  demoUrl?: string;
  videoUrl?: string;
  screenshots?: string[];
  tags?: string[];
  industries?: string[];
  isVerified?: boolean;
  approvalStatus?: string;
  rawIndustry?: string;
  companyName?: string;
  companyGstin?: string;
  contactName?: string;
  contactPhone?: string;
  teamSize?: string;
  companyLinkedin?: string;
  companyBlurb?: string;
  founders?: string;
  founderLinkedin?: string;
  city?: string;
  foundedYear?: number;
  isFeatured?: boolean;
  promotionId?: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  desc?: string;
}

export interface Review {
  id: string;
  agentId: number;
  userId: string;
  userEmail?: string;
  userPrefix?: string;
  ratingOverall: number;
  ratingEaseUse: number;
  ratingValue: number;
  ratingSupport: number;
  ratingRelevance: number;
  content: string;
  recommend: boolean;
  useCase?: string;
  helpfulVotes: number;
  unhelpfulVotes: number;
  userVote?: 'helpful' | 'unhelpful';
  approvalStatus: string;
  isReported: boolean;
  createdAt: string;
  response?: {
    content: string;
    createdAt: string;
  };
}

export interface ReviewDB {
  id: string;
  agent_id: number;
  user_id: string;
  rating_overall: number;
  rating_ease_use: number;
  rating_value: number;
  rating_support: number;
  rating_relevance: number;
  content: string;
  recommend: boolean;
  use_case?: string;
  approval_status: string;
  is_reported: boolean;
  created_at: string;
  helpful_count?: number;
  unhelpful_count?: number;
  user_vote?: 'helpful' | 'unhelpful';
  helpful_votes?: { count: number }[];
  response?: { content: string; created_at: string }[];
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  recommendationRate: number;
  breakdown: {
    [key: number]: number; // 5: count, 4: count, etc.
  };
  dimensions: {
    easeOfUse: number;
    valueForMoney: number;
    supportQuality: number;
    globalRelevance: number;
  };
}

export interface ReviewVote {
  reviewId: string;
  userId: string;
  voteType: 'helpful' | 'unhelpful';
}

export interface SearchParams {
  q?: string;
  categories?: string[];
  pricingModels?: string[];
  minRating?: number;
  isVerified?: boolean;
  globalAvailability?: boolean;
  hasFreeTrial?: boolean;
  industries?: string[];
  sort?: 'relevance' | 'rating' | 'newest' | 'reviews';
  limit?: number;
  offset?: number;
  featuredOnly?: boolean;
}

export interface PromotionDB {
  id: string;
  agent_id: number;
  user_id: string;
  type: 'featured_category' | 'featured_home';
  category?: string;
  start_date: string;
  end_date: string;
  transaction_id?: string;
  status: 'active' | 'expired' | 'manual_authorized';
  impressions: number;
  clicks: number;
}

export interface Promotion {
  id: string;
  agentId: number;
  userId: string;
  type: 'featured_category' | 'featured_home';
  category?: string;
  startDate: string;
  endDate: string;
  transactionId?: string;
  status: 'active' | 'expired' | 'manual_authorized';
  impressions: number;
  clicks: number;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail?: string;
  agentId?: number;
  amount: number;
  currency: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Claim {
  id: string;
  agentId: number;
  userId: string;
  workEmail: string;
  role: string;
  note?: string;
  status: 'pending_email' | 'verified' | 'approved' | 'rejected';
  verificationToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimDB {
  id: string;
  agent_id: number;
  user_id: string;
  work_email: string;
  role: string;
  note?: string;
  status: 'pending_email' | 'verified' | 'approved' | 'rejected';
  verification_token?: string;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  agentId: number;
  userId?: string;
  actionType: 'view' | 'click' | 'cta_click'; // ✅ Support both 'click' and 'cta_click' for backward compatibility
  createdAt: string;
}

export interface InteractionDB {
  id: string;
  agent_id: number;
  user_id?: string;
  action_type: 'view' | 'click' | 'cta_click'; // ✅ Support both 'click' and 'cta_click' for backward compatibility
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: 'user' | 'vendor' | 'admin';
  initial?: string;
  is_admin?: boolean;
  is_suspended?: boolean;
  user_metadata?: {
    role?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface AuthEvent extends CustomEvent {
  detail: {
    view: 'signin' | 'register';
    role?: 'user' | 'vendor';
  };
}
