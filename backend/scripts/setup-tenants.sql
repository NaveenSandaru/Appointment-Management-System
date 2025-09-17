-- Manual SQL script to setup tenants and migrate data

-- Step 1: Create tenants table if it doesn't exist
CREATE TABLE IF NOT EXISTS tenants (
  tenant_id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR NOT NULL,
  display_name VARCHAR NOT NULL,
  domain VARCHAR UNIQUE,
  logo_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Step 2: Insert default tenant
INSERT INTO tenants (tenant_id, name, display_name, domain, is_active, created_at, updated_at)
VALUES ('default-tenant', 'Default Organization', 'Default Organization', 'default.com', true, NOW(), NOW())
ON CONFLICT (tenant_id) DO NOTHING;

-- Step 3: Add tenant_id column to existing tables if not exists
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tenant_id VARCHAR DEFAULT 'default-tenant';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS tenant_id VARCHAR DEFAULT 'default-tenant';
ALTER TABLE services ADD COLUMN IF NOT EXISTS tenant_id VARCHAR DEFAULT 'default-tenant';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS tenant_id VARCHAR DEFAULT 'default-tenant';
ALTER TABLE appointment_history ADD COLUMN IF NOT EXISTS tenant_id VARCHAR DEFAULT 'default-tenant';
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS tenant_id VARCHAR DEFAULT 'default-tenant';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS tenant_id VARCHAR DEFAULT 'default-tenant';
ALTER TABLE email_verification ADD COLUMN IF NOT EXISTS tenant_id VARCHAR DEFAULT 'default-tenant';
ALTER TABLE security_questions ADD COLUMN IF NOT EXISTS tenant_id VARCHAR DEFAULT 'default-tenant';
ALTER TABLE client_user_questions ADD COLUMN IF NOT EXISTS tenant_id VARCHAR DEFAULT 'default-tenant';

-- Step 4: Update existing NULL values
UPDATE clients SET tenant_id = 'default-tenant' WHERE tenant_id IS NULL;
UPDATE admins SET tenant_id = 'default-tenant' WHERE tenant_id IS NULL;
UPDATE services SET tenant_id = 'default-tenant' WHERE tenant_id IS NULL;
UPDATE appointments SET tenant_id = 'default-tenant' WHERE tenant_id IS NULL;
UPDATE appointment_history SET tenant_id = 'default-tenant' WHERE tenant_id IS NULL;
UPDATE ratings SET tenant_id = 'default-tenant' WHERE tenant_id IS NULL;
UPDATE reviews SET tenant_id = 'default-tenant' WHERE tenant_id IS NULL;
UPDATE email_verification SET tenant_id = 'default-tenant' WHERE tenant_id IS NULL;
UPDATE security_questions SET tenant_id = 'default-tenant' WHERE tenant_id IS NULL;
UPDATE client_user_questions SET tenant_id = 'default-tenant' WHERE tenant_id IS NULL;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_tenant_id ON clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_admins_tenant_id ON admins(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_id ON appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointment_history_tenant_id ON appointment_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ratings_tenant_id ON ratings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_tenant_id ON reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tenant_id ON email_verification(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_questions_tenant_id ON security_questions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_user_questions_tenant_id ON client_user_questions(tenant_id);

-- Step 6: Make tenant_id NOT NULL
ALTER TABLE clients ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE admins ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE services ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE appointments ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE appointment_history ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE ratings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE reviews ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE email_verification ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE security_questions ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE client_user_questions ALTER COLUMN tenant_id SET NOT NULL;