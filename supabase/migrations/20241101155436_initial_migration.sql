-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table with RLS
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    branding_logo_url TEXT,
    branding_primary_color TEXT,
    branding_secondary_color TEXT,
    branding_additional JSONB DEFAULT '{}',
    domain TEXT,
    cancellation_policy TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create users table with RLS
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

-- Create courts table with RLS
CREATE TABLE courts (
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    court_number SERIAL,
    PRIMARY KEY (company_id, court_number),
    name TEXT NOT NULL,
    location TEXT,
    available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- Companies are only readable by users who belong to them
CREATE POLICY companies_select ON companies
    FOR SELECT TO authenticated
    USING (id IN (
        SELECT company_id 
        FROM users 
        WHERE users.id = auth.uid()
    ));

-- Users can modify companies they belong to
CREATE POLICY companies_modify ON companies
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.company_id = companies.id
    ));

-- Users can read/update their own data
CREATE POLICY users_select_own ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- Add this new policy for user insertion
CREATE POLICY users_insert_public ON users
    FOR INSERT
    WITH CHECK (true);  -- Allows public insertion for signup

-- Courts are readable by users who belong to the company
CREATE POLICY courts_select ON courts
    FOR SELECT TO authenticated
    USING (company_id IN (
        SELECT company_id
        FROM users
        WHERE users.id = auth.uid()
    ));

-- Users can modify courts in their company
CREATE POLICY courts_modify ON courts
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.company_id = courts.company_id
    ));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courts_updated_at
    BEFORE UPDATE ON courts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
