CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    sports TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    
    stripe_account_id TEXT UNIQUE,
    stripe_account_enabled BOOLEAN DEFAULT false,
    stripe_account_details JSONB,
    stripe_webhook_secret TEXT,
    stripe_payment_methods TEXT[] DEFAULT ARRAY['card']::TEXT[],
    stripe_currency TEXT DEFAULT 'usd',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN companies.stripe_account_details IS 'Stores Stripe account metadata like business type, capabilities, etc.';

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    company_id UUID REFERENCES companies(id),
    
    role member_role NOT NULL DEFAULT 'member',
    invited_by UUID REFERENCES auth.users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- -- Authentication fields
    -- last_login_at TIMESTAMPTZ,
    -- email_verified_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Owners and admins can manage members" ON users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 
            FROM users 
            WHERE id = auth.uid() 
            AND company_id = users.company_id 
            AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM users 
            WHERE id = auth.uid() 
            AND company_id = users.company_id 
            AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "users_insert_public" ON users
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
        AND role IN ('owner', 'admin')
    ));

CREATE POLICY companies_delete ON companies
    FOR DELETE TO authenticated
    USING (id IN (
        SELECT company_id 
        FROM users 
        WHERE users.id = auth.uid()
        AND role = 'owner'
    ));

CREATE POLICY "Public can view companies"
  ON companies FOR SELECT
  USING (true);
