-- ============================================
-- Atomic Promotion Activation & Idempotency
-- ============================================

CREATE OR REPLACE FUNCTION public.activate_promotion(
  p_agent_id INTEGER,
  p_plan TEXT,
  p_payment_id TEXT,
  p_amount NUMERIC
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_end_date TIMESTAMPTZ;
  v_result JSON;
BEGIN
  -- 1. Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- 2. Idempotency Check
  IF EXISTS (SELECT 1 FROM public.transactions WHERE gateway_payment_id = p_payment_id) THEN
    RETURN json_build_object('success', false, 'error', 'Payment already processed');
  END IF;

  -- 3. Ownership Check (Redundant but safe for DB level)
  IF NOT EXISTS (SELECT 1 FROM public.agents WHERE id = p_agent_id AND user_id = v_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Agent ownership mismatch');
  END IF;

  -- 4. Calculate End Date
  IF p_plan = 'weekly' THEN
    v_end_date := NOW() + interval '7 days';
  ELSIF p_plan = 'monthly' THEN
    v_end_date := NOW() + interval '30 days';
  ELSE
    RETURN json_build_object('success', false, 'error', 'Invalid plan type');
  END IF;

  -- 5. Perform Atomic Updates
  -- A. Insert Transaction
  INSERT INTO public.transactions (user_id, agent_id, amount, gateway_payment_id, status)
  VALUES (v_user_id, p_agent_id, p_amount, p_payment_id, 'completed');

  -- B. Insert Promotion
  INSERT INTO public.promotions (agent_id, user_id, type, end_date, status)
  VALUES (p_agent_id, v_user_id, 'featured_home', v_end_date, 'active');

  -- C. Update Agent Status
  UPDATE public.agents 
  SET is_featured = true, 
      updated_at = NOW() 
  WHERE id = p_agent_id;

  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
