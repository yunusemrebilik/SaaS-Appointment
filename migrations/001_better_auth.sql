create extension if not exists pgcrypto;

create table users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null unique,
    email_verified boolean not null default false,
    image text,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

create table organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    logo text,
    metadata text,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

create table sessions (
    id uuid primary key default gen_random_uuid(),
    expires_at timestamptz not null,
    token text not null unique,
    ip_address text,
    user_agent text,
    user_id uuid not null references users(id) on delete cascade,
    active_organization_id uuid references organizations(id) on delete set null,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

create table accounts (
    id uuid primary key default gen_random_uuid(),
    account_id text not null,
    provider_id text not null,
    user_id uuid not null references users(id) on delete cascade,
    access_token text,
    refresh_token text,
    id_token text,
    access_token_expires_at timestamptz,
    refresh_token_expires_at timestamptz,
    scope text,
    password text,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

create table verifications (
    id uuid primary key default gen_random_uuid(),
    identifier text not null,
    value text not null,
    expires_at timestamptz not null,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

create table members (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    role text not null,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

create table invitations (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    email text not null,
    role text,
    status text not null default 'pending',
    expires_at timestamptz not null,
    inviter_id uuid not null references users(id) on delete cascade,
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
);

create index idx_sessions_user on sessions(user_id);
create index idx_accounts_user on accounts(user_id);
create index idx_verifications_idnt on verifications(identifier);
create index idx_members_org on members(organization_id);
create index idx_members_user on members(user_id);
create index idx_invitations_org on invitations(organization_id);
create index idx_invitations_email on invitations(email);
create index idx_session_active_org on sessions(active_organization_id);