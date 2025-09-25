import jwt from 'jsonwebtoken';
import { detectTenantFromUser } from '../utils/tenant-detection.js';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    // Try to get tenant_id from header first
    const tenantId = req.headers['x-tenant-id'] || req.query.tenant_id;
    
    if (token == null) return res.status(401).json('Access denied');
    
    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (error, user) => {
        if (error) return res.status(403).json('Invalid token');
        
        // Extract tenant_id from token payload or use header/query
        const finalTenantId = user.tenant_id || tenantId;
        
        if (!finalTenantId) {
            return res.status(400).json('Tenant ID missing');
        }
        
        req.user = user;
        req.tenantId = finalTenantId;
        next();
    });
}

// New middleware with automatic tenant detection
function authenticateTokenWithTenant(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) {
        return res.status(401).json({ error: 'Access denied - No token provided' });
    }
    
    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, async (error, user) => {
        if (error) {
            console.log('❌ JWT verification failed:', error.message);
            return res.status(403).json({ error: 'Invalid token' });
        }
        
        console.log('✅ JWT verified successfully for user:', user.email);
        
        try {
            // First try to get tenant_id from token or headers
            let tenantId = user.tenant_id || 
                          req.headers['x-tenant-id'] || 
                          req.query.tenant_id || 
                          req.body.tenant_id;
            
            console.log('🏢 Tenant detection - user.tenant_id:', user.tenant_id);
            
            // If no tenant_id found, auto-detect from user data
            if (!tenantId && user.email) {
                console.log('🔍 Auto-detecting tenant for:', user.email);
                tenantId = await detectTenantFromUser(user.email, user.role);
            }
            
            if (!tenantId) {
                console.log('❌ No tenant found for user');
                return res.status(400).json({ 
                    error: 'No tenant assigned to this user. Please contact administrator.' 
                });
            }
            
            console.log('✅ Authentication successful - tenantId:', tenantId);
            req.user = user;
            req.tenantId = tenantId;
            next();
        } catch (detectError) {
            console.error('Tenant detection error:', detectError);
            res.status(500).json({ error: 'Failed to detect tenant' });
        }
    });
}

// Super Admin Authentication Middleware
function authenticateSuperAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.status(401).json('Access denied');
    
    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (error, user) => {
        if (error) return res.status(403).json('Invalid token');
        
        // Check if user is a super admin
        if (user.role !== 'super_admin') {
            return res.status(403).json('Super admin access required');
        }
        
        req.user = user;
        next();
    });
}

export { authenticateToken, authenticateTokenWithTenant, authenticateSuperAdmin };