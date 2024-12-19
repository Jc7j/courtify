CREATE TABLE courts (
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
    court_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (facility_id, court_number),
    CONSTRAINT positive_court_number CHECK (court_number > 0)
);

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

CREATE POLICY courts_select ON courts
    FOR SELECT TO authenticated
    USING (facility_id = (
        SELECT facility_id
        FROM users
        WHERE users.id = auth.uid()
    ));

CREATE POLICY courts_insert ON courts
    FOR INSERT TO authenticated
    WITH CHECK (facility_id = (
        SELECT facility_id
        FROM users
        WHERE users.id = auth.uid()
    ));

CREATE POLICY courts_update ON courts
    FOR UPDATE TO authenticated
    USING (facility_id = (
        SELECT facility_id
        FROM users
        WHERE users.id = auth.uid()
    ));

CREATE POLICY courts_delete ON courts
    FOR DELETE TO authenticated
    USING (facility_id = (
        SELECT facility_id
        FROM users
        WHERE users.id = auth.uid()
    ));

CREATE POLICY "Public can view courts" ON courts
    FOR SELECT
    USING (true);
