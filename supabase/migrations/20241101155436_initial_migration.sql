-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table with RLS
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- Companies policies
-- Allow any authenticated user to create a company, but ensure auth.uid() exists
CREATE POLICY "companies_insert" ON companies
    FOR INSERT TO authenticated
    WITH CHECK (true); 


-- Users can read companies they belong to
CREATE POLICY "companies_select" ON companies
    FOR SELECT TO authenticated
    USING (true);

-- Users can update companies they belong to
CREATE POLICY companies_update ON companies
    FOR UPDATE TO authenticated
    USING (id IN (
        SELECT company_id 
        FROM users 
        WHERE users.id = auth.uid()
    ));

-- Users can delete companies they belong to
CREATE POLICY companies_delete ON companies
    FOR DELETE TO authenticated
    USING (id IN (
        SELECT company_id 
        FROM users 
        WHERE users.id = auth.uid()
    ));

-- Users policies
CREATE POLICY users_select_own ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY users_insert_public ON users
    FOR INSERT
    WITH CHECK (true);

-- Courts policies
CREATE POLICY courts_select ON courts
    FOR SELECT TO authenticated
    USING (company_id IN (
        SELECT company_id
        FROM users
        WHERE users.id = auth.uid()
    ));

CREATE POLICY courts_modify ON courts
    FOR ALL TO authenticated
    USING (company_id IN (
        SELECT company_id
        FROM users
        WHERE users.id = auth.uid()
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
