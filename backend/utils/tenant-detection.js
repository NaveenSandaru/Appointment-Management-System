import { PrismaClient } from '@prisma/client';

// Create a separate Prisma client without middleware for tenant detection
const prismaRaw = new PrismaClient();

/**
 * Automatically detect tenant_id for a user from the database
 * This avoids requiring frontend changes by looking up the user's tenant
 * @param {string} email - User's email address
 * @param {string} role - User's role (client, admin, etc.)
 * @returns {Promise<string|null>} - The tenant_id or null if not found
 */
export async function detectTenantFromUser(email, role = 'client') {
  try {
    let tenantId = null;
    
    // Use raw queries to bypass tenant middleware
    if (role === 'client') {
      const result = await prismaRaw.$queryRaw`
        SELECT tenant_id FROM clients WHERE email = ${email}
      `;
      tenantId = result.length > 0 ? result[0].tenant_id : null;
    } else if (role === 'admin') {
      const result = await prismaRaw.$queryRaw`
        SELECT tenant_id FROM admins WHERE email = ${email}
      `;
      tenantId = result.length > 0 ? result[0].tenant_id : null;
    }
    
    return tenantId || 'default-tenant';
  } catch (error) {
    console.error('Error detecting tenant:', error);
    return 'default-tenant';
  }
}

/**
 * Enhanced authentication middleware that automatically detects tenant
 * Combines user authentication with automatic tenant detection
 */
export function createTenantAwareAuth(originalAuth) {
  return async (req, res, next) => {
    // First run the original authentication
    originalAuth(req, res, async (error) => {
      if (error) return next(error);
      
      try {
        // If we already have a tenant_id from token, use it
        if (req.tenantId) {
          return next();
        }
        
        // Auto-detect tenant from user data
        if (req.user && req.user.email) {
          const detectedTenantId = await detectTenantFromUser(req.user.email, req.user.role);
          
          if (!detectedTenantId) {
            return res.status(400).json({ 
              error: 'No tenant assigned to this user. Please contact administrator.' 
            });
          }
          
          // Add detected tenant to request
          req.tenantId = detectedTenantId;
          req.user.tenant_id = detectedTenantId;
        }
        
        next();
      } catch (detectError) {
        console.error('Tenant detection error:', detectError);
        res.status(500).json({ error: 'Failed to detect tenant' });
      }
    });
  };
}

/**
 * Middleware specifically for operations that need tenant context
 * Automatically detects tenant if not provided
 */
export async function autoTenantMiddleware(req, res, next) {
  try {
    // Check if we already have tenant_id from various sources
    let tenantId = req.tenantId || 
                   req.headers['x-tenant-id'] || 
                   req.query.tenant_id || 
                   req.body.tenant_id ||
                   (req.user && req.user.tenant_id);
    
    // If no tenant_id found and we have user info, auto-detect
    if (!tenantId && req.user && req.user.email) {
      tenantId = await detectTenantFromUser(req.user.email, req.user.role);
    }
    
    if (!tenantId) {
      return res.status(400).json({ 
        error: 'Tenant ID could not be determined. Please ensure user is assigned to a tenant.' 
      });
    }
    
    req.tenantId = tenantId;
    next();
  } catch (error) {
    console.error('Auto tenant middleware error:', error);
    res.status(500).json({ error: 'Failed to determine tenant context' });
  }
}