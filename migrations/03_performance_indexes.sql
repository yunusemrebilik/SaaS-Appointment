-- Migration: Add performance indexes for frequently accessed query patterns
-- Date: 2026-01-30

-- Index for member weekly schedules by member and day of week
-- Used by availability.ts when fetching schedules for slot generation
CREATE INDEX idx_member_schedules_member_day 
ON member_weekly_schedules(member_id, day_of_week);

-- Index for member schedule overrides by member and date
-- Used by availability.ts when checking overrides for a specific date range
CREATE INDEX idx_member_overrides_member_date 
ON member_schedule_overrides(member_id, date);

-- Partial index for active services per organization
-- Used by getServices, getPublicServices queries that filter by is_active = true
CREATE INDEX idx_services_org_active 
ON services(organization_id) 
WHERE is_active = true;

-- Index for member services by service_id
-- Used by getAvailableStaff to find all members who can perform a service
CREATE INDEX idx_member_services_service 
ON member_services(service_id);
