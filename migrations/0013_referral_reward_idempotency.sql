-- PRIME Sprint 3: prevent duplicate referral reward ledger entries.
PRAGMA foreign_keys = ON;

CREATE UNIQUE INDEX IF NOT EXISTS uq_referral_reward_customer
  ON loyalty_transactions(customer_id, reference_type, reference_id, kind)
  WHERE reference_type = 'referral' AND kind = 'referral';
