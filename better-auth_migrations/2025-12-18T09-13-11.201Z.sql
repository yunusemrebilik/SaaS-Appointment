alter table "sessions" add column "activeOrganizationId" text;

create table "organizations" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "name" text not null, "slug" text not null unique, "logo" text, "created_at" timestamptz not null, "metadata" text);

create table "members" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "organization_id" uuid not null references "organizations" ("id") on delete cascade, "user_id" uuid not null references "users" ("id") on delete cascade, "role" text not null, "created_at" timestamptz not null);

create table "invitations" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "organization_id" uuid not null references "organizations" ("id") on delete cascade, "email" text not null, "role" text, "status" text not null, "expires_at" timestamptz not null, "created_at" timestamptz default CURRENT_TIMESTAMP not null, "inviter_id" uuid not null references "users" ("id") on delete cascade);

create index "members_organization_id_idx" on "members" ("organization_id");

create index "members_user_id_idx" on "members" ("user_id");

create index "invitations_organization_id_idx" on "invitations" ("organization_id");

create index "invitations_email_idx" on "invitations" ("email");