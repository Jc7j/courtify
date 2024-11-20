CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION update_past_availabilities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE court_availabilities
    SET 
        status = 'past',
        updated_at = NOW()
    WHERE 
        end_time < timezone('UTC', NOW())
        AND status != 'past';
END;
$$;

SELECT cron.schedule(
    'update-past-availabilities', 
    '0 0 * * *',                  -- cron schedule (midnight daily)
    'SELECT update_past_availabilities()'
);

GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

COMMENT ON FUNCTION update_past_availabilities IS 
'Updates court_availabilities status to past for any availability that has ended before the current time. Runs daily at midnight UTC.';
