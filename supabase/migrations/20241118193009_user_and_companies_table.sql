CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    sports TEXT NOT NULL,
    businessinfo TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    
    -- Stripe Integration Fields
    stripe_account_id TEXT UNIQUE,
    stripe_account_enabled BOOLEAN DEFAULT false,
    stripe_account_details JSONB,
    stripe_webhook_secret TEXT,
    stripe_payment_methods TEXT[] DEFAULT ARRAY['card']::TEXT[],
    stripe_currency TEXT DEFAULT 'usd',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment to explain JSONB field
COMMENT ON COLUMN companies.stripe_account_details IS 'Stores Stripe account metadata like business type, capabilities, etc.';

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    company_id UUID REFERENCES companies(id),
    last_login_at TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY users_insert_public ON users
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "companies_insert" ON companies
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "companies_select" ON companies
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY companies_update ON companies
    FOR UPDATE TO authenticated
    USING (id IN (
        SELECT company_id 
        FROM users 
        WHERE users.id = auth.uid()
    ));

CREATE POLICY companies_delete ON companies
    FOR DELETE TO authenticated
    USING (id IN (
        SELECT company_id 
        FROM users 
        WHERE users.id = auth.uid()
    ));

CREATE POLICY "Public can view companies"
  ON companies FOR SELECT
  USING (true);
