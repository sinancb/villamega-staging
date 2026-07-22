-- ============================================================
-- 011_customer_role.sql — Add the 'customer' role value
-- Split into its own migration on purpose: Postgres will not let
-- a freshly-added enum value be referenced in the same transaction
-- that added it. Run this one, let it commit, THEN run
-- 012_customer_auth.sql (which uses 'customer').
-- ============================================================

alter type user_role add value if not exists 'customer';
