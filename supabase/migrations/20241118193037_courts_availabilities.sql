CREATE TYPE availability_status AS ENUM ('available', 'held', 'booked', 'past');

CREATE TABLE court_availabilities (
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    court_number INTEGER NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status availability_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (company_id, court_number, start_time),
    FOREIGN KEY (company_id, court_number) REFERENCES courts(company_id, court_number) ON DELETE CASCADE,
    
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

ALTER TABLE court_availabilities ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_court_availabilities_lookup ON court_availabilities (company_id, court_number, start_time);
CREATE INDEX idx_court_availabilities_status ON court_availabilities (status);
CREATE INDEX idx_court_availabilities_end_time ON court_availabilities(end_time);

ALTER TABLE court_availabilities
ADD CONSTRAINT no_overlapping_slots 
EXCLUDE USING gist (
    company_id WITH =,
    court_number WITH =,
    tstzrange(start_time, end_time) WITH &&
);

CREATE POLICY "court_availabilities_select_auth" ON court_availabilities
    FOR SELECT TO authenticated
    USING (
        company_id IN (
            SELECT company_id 
            FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "court_availabilities_insert_auth" ON court_availabilities
    FOR INSERT TO authenticated
    WITH CHECK (
        company_id IN (
            SELECT company_id 
            FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "court_availabilities_update_auth" ON court_availabilities
    FOR UPDATE TO authenticated
    USING (
        company_id IN (
            SELECT company_id 
            FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "court_availabilities_delete_auth" ON court_availabilities
    FOR DELETE TO authenticated
    USING (
        company_id IN (
            SELECT company_id 
            FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "court_availabilities_select_anon" ON court_availabilities
    FOR SELECT TO anon
    USING (status = 'available');

CREATE POLICY "Public can view available courts"
  ON court_availabilities FOR SELECT
  USING (
    status = 'available' AND
    end_time > timezone('UTC', now())
  );
