create table "users" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "name" text not null, "email" text not null unique, "email_verified" boolean not null, "image" text, "created_at" timestamptz default CURRENT_TIMESTAMP not null, "updated_at" timestamptz default CURRENT_TIMESTAMP not null);

create table "sessions" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "expires_at" timestamptz not null, "token" text not null unique, "created_at" timestamptz default CURRENT_TIMESTAMP not null, "updated_at" timestamptz not null, "ip_address" text, "user_agent" text, "user_id" uuid not null references "users" ("id") on delete cascade, "active_organization_id" text);

create table "accounts" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "account_id" text not null, "provider_id" text not null, "user_id" uuid not null references "users" ("id") on delete cascade, "access_token" text, "refresh_token" text, "id_token" text, "access_token_expires_at" timestamptz, "refresh_token_expires_at" timestamptz, "scope" text, "password" text, "created_at" timestamptz default CURRENT_TIMESTAMP not null, "updated_at" timestamptz not null);

create table "verifications" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "identifier" text not null, "value" text not null, "expires_at" timestamptz not null, "created_at" timestamptz default CURRENT_TIMESTAMP not null, "updated_at" timestamptz default CURRENT_TIMESTAMP not null);

create table "organizations" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "name" text not null, "slug" text not null unique, "logo" text, "created_at" timestamptz not null, "metadata" text);

create table "members" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "organization_id" uuid not null references "organizations" ("id") on delete cascade, "user_id" uuid not null references "users" ("id") on delete cascade, "role" text not null, "created_at" timestamptz not null);

create table "invitations" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "organization_id" uuid not null references "organizations" ("id") on delete cascade, "email" text not null, "role" text, "status" text not null, "expires_at" timestamptz not null, "created_at" timestamptz default CURRENT_TIMESTAMP not null, "inviter_id" uuid not null references "users" ("id") on delete cascade);

create index "sessions_user_id_idx" on "sessions" ("user_id");

create index "accounts_user_id_idx" on "accounts" ("user_id");

create index "verifications_identifier_idx" on "verifications" ("identifier");

create index "members_organization_id_idx" on "members" ("organization_id");

create index "members_user_id_idx" on "members" ("user_id");

create index "invitations_organization_id_idx" on "invitations" ("organization_id");

create index "invitations_email_idx" on "invitations" ("email");