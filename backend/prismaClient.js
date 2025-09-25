import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List of tenant-scoped models
const TENANT_SCOPED_MODELS = [
  'clients',
  'services', 
  'email_verification',
  'security_questions',
  'client_user_questions',
  'admins',
  'appointments',
  'appointment_history',
  'ratings',
  'reviews'
];

prisma.$use(async (params, next) => {
  // Only apply to tenant-scoped 
  if (TENANT_SCOPED_MODELS.includes(params.model)) {
    const tenantId = params.args?.tenantId || (params.args?.data && params.args.data.tenantId);

    // Skip tenant enforcement
    const skipTenantEnforcement = params.args?.skipTenantEnforcement;
    
    if (skipTenantEnforcement) {
      // Remove the skipTenantEnforcement flag before proceeding
      delete params.args.skipTenantEnforcement;
      return next(params);
    }

    // For read operations
    if (['findMany', 'findUnique', 'findFirst', 'count', 'aggregate'].includes(params.action)) {
      if (!tenantId && !params.args?.where?.tenant_id) {
        throw new Error(`Tenant ID missing for ${params.model} ${params.action} operation`);
      }
      
      // Add tenant filter to where clause
      params.args.where = {
        ...params.args.where,
        tenant_id: tenantId || params.args.where.tenant_id,
      };
    }
    
    // For write operations (create, update, upsert)
    if (['create', 'update', 'upsert', 'createMany'].includes(params.action)) {
      if (params.action === 'create' || params.action === 'upsert') {
        if (!tenantId && !params.args?.data?.tenant_id) {
          throw new Error(`Tenant ID missing for ${params.model} ${params.action} operation`);
        }
        // Add tenant_id to data
        if (params.args.data) {
          params.args.data.tenant_id = tenantId || params.args.data.tenant_id;
        }
      }
      
      if (params.action === 'createMany') {
        if (!tenantId) {
          throw new Error(`Tenant ID missing for ${params.model} ${params.action} operation`);
        }
        // Add tenant_id to all records
        if (params.args.data && Array.isArray(params.args.data)) {
          params.args.data = params.args.data.map(record => ({
            ...record,
            tenant_id: tenantId
          }));
        }
      }
      
      if (params.action === 'update') {
        if (!tenantId && !params.args?.where?.tenant_id) {
          throw new Error(`Tenant ID missing for ${params.model} ${params.action} operation`);
        }
        // Add tenant filter to where clause for updates
        params.args.where = {
          ...params.args.where,
          tenant_id: tenantId || params.args.where.tenant_id,
        };
      }
    }
    
    // For delete operations
    if (['delete', 'deleteMany'].includes(params.action)) {
      if (!tenantId && !params.args?.where?.tenant_id) {
        throw new Error(`Tenant ID missing for ${params.model} ${params.action} operation`);
      }
      // Add tenant filter to where clause
      params.args.where = {
        ...params.args.where,
        tenant_id: tenantId || params.args.where.tenant_id,
      };
    }
  }

  return next(params);
});

export default prisma;