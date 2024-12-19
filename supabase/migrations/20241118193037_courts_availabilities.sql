CREATE TYPE availability_status AS ENUM ('available', 'held', 'booked');

CREATE TABLE court_availabilities (
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    court_number INTEGER NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status availability_status NOT NULL DEFAULT 'available',
    -- created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (company_id, court_number, start_time),
    FOREIGN KEY (company_id, court_number) REFERENCES courts(company_id, court_number) ON DELETE RESTRICT,
    
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

ALTER TABLE court_availabilities ENABLE ROW LEVEL SECURITY;

ALTER TABLE court_availabilities
ADD CONSTRAINT no_overlapping_slots 
EXCLUDE USING gist (
    company_id WITH =,
    court_number WITH =,
    tstzrange(start_time, end_time) WITH &&
);

CREATE POLICY "Public can manage courts" ON court_availabilities
    FOR ALL
    USING (true)
    WITH CHECK (true);


-- Enable realtime for court_availabilities
alter publication supabase_realtime add table court_availabilities;
