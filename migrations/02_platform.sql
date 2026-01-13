create extension if not exists btree_gist;

create table services (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    name text not null,
    description text,
    duration_min integer not null check (duration_min > 0),
    price_cents integer not null check (price_cents >= 0),
    is_active boolean default true,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

create table member_services (
    member_id uuid not null references members(id) on delete cascade,
    service_id uuid not null references services(id) on delete cascade,
    primary key (member_id, service_id)
);

create table bookings (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    member_id uuid references members(id) on delete restrict,
    service_id uuid references services(id) on delete restrict,
    customer_phone text not null,
    customer_name text not null,
    start_time timestamptz not null,
    end_time timestamptz not null,
    price_at_booking integer not null,
    notes text,
    status text not null check (status in ('pending', 'confirmed', 'cancelled', 'no_show', 'completed')) default 'pending',
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,

    constraint no_overlapping_bookings
    exclude using gist (
        member_id with =,
        tstzrange(start_time, end_time) with &&
    )
    where (status in ('pending', 'confirmed'))
);

create table banned_customers (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    customer_phone text not null,
    reason text,
    banned_at timestamptz not null default current_timestamp,
    banned_until timestamptz,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,

    constraint uq_banned_customer_org unique (organization_id, customer_phone)
);

create table member_weekly_schedules (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references members(id) on delete cascade,
    day_of_week integer not null check (day_of_week between 0 and 6),
    start_time time not null,
    end_time time not null,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,

    constraint uq_member_day_start unique (member_id, day_of_week, start_time),
    constraint weekly_schedules_time_sanity check (end_time > start_time)
);

create table member_schedule_overrides (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references members(id) on delete cascade,
    type text not null check (type in ('day_off', 'time_off', 'extra_work')),
    date date not null,
    start_time time,
    end_time time,
    reason text,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,

    constraint overrides_time_sanity check (
        (start_time is null and end_time is null) or (end_time > start_time)
    ),
    constraint check_override_types check (
        (type = 'day_off' and start_time is null and end_time is null) or
        (type in ('time_off', 'extra_work') and start_time is not null and end_time is not null)
    )
);

create index idx_services_org on services(organization_id);
create index idx_member_services_member on member_services(member_id);
create index idx_bookings_org_date on bookings(organization_id, start_time);
create index idx_bookings_customer_phone on bookings(customer_phone);
create index idx_bookings_member_date on bookings(member_id, start_time);