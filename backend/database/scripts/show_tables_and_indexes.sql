-- Query to list all tables in the public schema
SELECT tablename 
FROM pg_catalog.pg_tables 
WHERE schemaname = 'public';

-- Query to list all indexes and their columns for public tables
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
ORDER BY
    tablename,
    indexname;
