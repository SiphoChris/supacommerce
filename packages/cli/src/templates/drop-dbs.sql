do $$ declare
    r record;
begin
    -- Drop all tables
    for r in (select tablename from pg_tables where schemaname = 'public') loop
        execute 'drop table if exists public.' || quote_ident(r.tablename) || ' cascade';
    end loop;
    -- Drop all enums
    for r in (select typname from pg_type where typtype = 'e' and typnamespace = 'public'::regnamespace) loop
        execute 'drop type if exists public.' || quote_ident(r.typname) || ' cascade';
    end loop;
end $$;