-- Migration to shift from India-focused pricing columns to Global pricing columns

ALTER TABLE agents RENAME COLUMN has_india_pricing TO global_availability;
ALTER TABLE agents RENAME COLUMN inr_price TO usd_price;

-- If there are any views or functions depending on this, they would need updating too.
-- Specifically, if the `activate_promotion` RPC uses these, we should update it, but it only uses `p_amount`.
-- However, we can also comment that `global_availability` essentially means the agent has a localized global pricing model.
