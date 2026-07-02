-- 1. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id INT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating_ease_use SMALLINT CHECK (rating_ease_use BETWEEN 1 AND 5),
    rating_value SMALLINT CHECK (rating_value BETWEEN 1 AND 5),
    rating_support SMALLINT CHECK (rating_support BETWEEN 1 AND 5),
    rating_relevance SMALLINT CHECK (rating_relevance BETWEEN 1 AND 5),
    rating_overall DECIMAL(3,2), -- Average of the 4 above
    content TEXT NOT NULL,
    recommend BOOLEAN DEFAULT true,
    use_case TEXT,
    approval_status TEXT DEFAULT 'approved',
    is_reported BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    -- Ensure one review per user per tool
    UNIQUE(user_id, agent_id)
);

-- 2. Create Review Votes Table
CREATE TABLE IF NOT EXISTS public.review_votes (
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('helpful', 'unhelpful')),
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (review_id, user_id)
);

-- 3. Create Review Responses Table
CREATE TABLE IF NOT EXISTS public.review_responses (
    review_id UUID PRIMARY KEY REFERENCES public.reviews(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Reviews
CREATE POLICY "Public reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (approval_status = 'approved');

CREATE POLICY "Users can insert their own reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- 6. Policies for Votes
CREATE POLICY "Votes are viewable by everyone" ON public.review_votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.review_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON public.review_votes
    FOR UPDATE USING (auth.uid() = user_id);

-- 7. Policies for Responses
CREATE POLICY "Responses are viewable by everyone" ON public.review_responses
    FOR SELECT USING (true);

CREATE POLICY "Vendors can respond to reviews" ON public.review_responses
    FOR INSERT WITH CHECK (true); -- We will check if user is the tool owner in app logic or via a more complex policy

-- 8. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_review_responses_updated_at BEFORE UPDATE ON public.review_responses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 9. Add metadata columns to agents table if not exists (for caching)
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS reviews_count INT DEFAULT 0;
