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

-- Create courts table with RLS and company-specific court numbering
CREATE TABLE courts (
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    court_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Make court_number unique within each company
    PRIMARY KEY (company_id, court_number),
    -- Add constraint to ensure court_number is positive
    CONSTRAINT positive_court_number CHECK (court_number > 0)
);

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- Create court_availabilities table with improved structure
CREATE TYPE availability_status AS ENUM ('available', 'booked', 'past');

CREATE TABLE court_availabilities (
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    court_number INTEGER NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status availability_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Composite primary key using natural identifiers
    PRIMARY KEY (company_id, court_number, start_time),
    
    -- Reference to courts table
    FOREIGN KEY (company_id, court_number) REFERENCES courts(company_id, court_number) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (start_time < end_time),
    CONSTRAINT valid_status CHECK (
        (status = 'past' AND end_time < NOW()) OR
        (status != 'past' AND end_time >= NOW())
    )
);

ALTER TABLE court_availabilities ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_court_availabilities_lookup ON court_availabilities (company_id, court_number, start_time);
CREATE INDEX idx_court_availabilities_status ON court_availabilities (status);

-- Companies policies
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
    USING (company_id = (
        SELECT company_id
        FROM users
        WHERE users.id = auth.uid()
    ));

CREATE POLICY courts_insert ON courts
    FOR INSERT TO authenticated
    WITH CHECK (company_id = (
        SELECT company_id
        FROM users
        WHERE users.id = auth.uid()
    ));

CREATE POLICY courts_update ON courts
    FOR UPDATE TO authenticated
    USING (company_id = (
        SELECT company_id
        FROM users
        WHERE users.id = auth.uid()
    ));

CREATE POLICY courts_delete ON courts
    FOR DELETE TO authenticated
    USING (company_id = (
        SELECT company_id
        FROM users
        WHERE users.id = auth.uid()
    ));

-- Policies for authenticated users (company staff)
CREATE POLICY "court_availabilities_select_auth" ON court_availabilities
    FOR SELECT TO authenticated
    USING (company_id = (
        SELECT company_id
        FROM users
        WHERE users.id = auth.uid()
    ));

CREATE POLICY "court_availabilities_insert_auth" ON court_availabilities
    FOR INSERT TO authenticated
    WITH CHECK (
        company_id = (
            SELECT company_id
            FROM users
            WHERE users.id = auth.uid()
        ) AND
        status IN ('available', 'booked') AND
        end_time > NOW()
    );

CREATE POLICY "court_availabilities_update_auth" ON court_availabilities
    FOR UPDATE TO authenticated
    USING (
        company_id = (
            SELECT company_id
            FROM users
            WHERE users.id = auth.uid()
        )
    )
    WITH CHECK (
        -- Only allow updating one field at a time
        (
            (OLD.status != NEW.status AND OLD.start_time = NEW.start_time AND OLD.end_time = NEW.end_time) OR
            (OLD.start_time != NEW.start_time AND OLD.status = NEW.status AND OLD.end_time = NEW.end_time) OR
            (OLD.end_time != NEW.end_time AND OLD.status = NEW.status AND OLD.start_time = NEW.start_time)
        ) AND
        -- Ensure valid status transitions
        (
            (NEW.status IN ('available', 'booked')) AND
            NEW.end_time > NOW()
        )
    );

CREATE POLICY "court_availabilities_delete_auth" ON court_availabilities
    FOR DELETE TO authenticated
    USING (
        company_id = (
            SELECT company_id
            FROM users
            WHERE users.id = auth.uid()
        ) AND
        end_time > NOW()
    );

-- Policies for anonymous users (guests)
CREATE POLICY "court_availabilities_select_anon" ON court_availabilities
    FOR SELECT TO anon
    USING (status = 'available' AND end_time > NOW());

-- Trigger to automatically update status to 'past'
CREATE OR REPLACE FUNCTION update_availability_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time < NOW() THEN
        NEW.status = 'past';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_availability_status
    BEFORE INSERT OR UPDATE ON court_availabilities
    FOR EACH ROW
    EXECUTE FUNCTION update_availability_status();

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

CREATE TRIGGER update_court_availabilities_updated_at
    BEFORE UPDATE ON court_availabilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add a constraint to prevent overlapping slots
ALTER TABLE court_availabilities
ADD CONSTRAINT no_overlapping_slots EXCLUDE USING gist (
    company_id WITH =,
    court_number WITH =,
    tstzrange(start_time, end_time) WITH &&
);

-- Add trigger to validate time changes
CREATE OR REPLACE FUNCTION validate_availability_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent changing past availabilities
    IF OLD.status = 'past' THEN
        RAISE EXCEPTION 'Cannot modify past availabilities';
    END IF;

    -- Validate time range
    IF NEW.start_time >= NEW.end_time THEN
        RAISE EXCEPTION 'Start time must be before end time';
    END IF;

    -- Update status if needed
    IF NEW.end_time < NOW() THEN
        NEW.status := 'past';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_availability_update
    BEFORE UPDATE ON court_availabilities
    FOR EACH ROW
    EXECUTE FUNCTION validate_availability_update();

