import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateSuperAdmin } from '../middleware/authentication.js';

const router = Router();
const prisma = new PrismaClient();

// Super Admin Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Find super admin by username
        const superAdmin = await prisma.super_admin.findFirst({
            where: { super_admin: username }
        });

        if (!superAdmin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, superAdmin.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: superAdmin.said,
                username: superAdmin.super_admin,
                role: 'super_admin'
            },
            process.env.ACCESS_TOKEN_KEY,
            { expiresIn: '24h' }
        );

        res.json({ 
            message: 'Login successful',
            token,
            user: {
                id: superAdmin.said,
                username: superAdmin.super_admin
            }
        });

    } catch (error) {
        console.error('Super admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create Tenant (Super Admin Only)
router.post('/tenants', authenticateSuperAdmin, async (req, res) => {
    const { name, display_name, domain, logo_url } = req.body;

    if (!name || !display_name) {
        return res.status(400).json({ error: 'Name and display_name are required' });
    }

    try {
        // Check if tenant name already exists
        const existingTenant = await prisma.tenants.findFirst({
            where: { name }
        });

        if (existingTenant) {
            return res.status(409).json({ error: 'Tenant name already exists' });
        }

        // Create tenant
        const tenant = await prisma.tenants.create({
            data: {
                name,
                display_name,
                domain,
                logo_url,
                is_active: true
            }
        });

        res.status(201).json({
            message: 'Tenant created successfully',
            tenant: {
                id: tenant.tennat_id,
                name: tenant.name,
                display_name: tenant.display_name,
                domain: tenant.domain,
                logo_url: tenant.logo_url,
                is_active: tenant.is_active,
                created_at: tenant.created_at
            }
        });

    } catch (error) {
        console.error('Create tenant error:', error);
        res.status(500).json({ error: 'Failed to create tenant' });
    }
});

// Get All Tenants with Admin Information (Super Admin Only)
router.get('/tenants', authenticateSuperAdmin, async (req, res) => {
    try {
        const tenants = await prisma.tenants.findMany({
            include: {
                admins: {
                    select: {
                        aid: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        clients: true,
                        services: true,
                        appointments: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const tenantsWithStats = tenants.map(tenant => ({
            id: tenant.tennat_id,
            name: tenant.name,
            display_name: tenant.display_name,
            domain: tenant.domain,
            logo_url: tenant.logo_url,
            is_active: tenant.is_active,
            created_at: tenant.created_at,
            updated_at: tenant.updated_at,
            admins: tenant.admins,
            stats: {
                clients: tenant._count.clients,
                services: tenant._count.services,
                appointments: tenant._count.appointments
            }
        }));

        res.json(tenantsWithStats);

    } catch (error) {
        console.error('Get tenants error:', error);
        res.status(500).json({ error: 'Failed to fetch tenants' });
    }
});

// Update Tenant (Super Admin Only)
router.put('/tenants/:tenantId', authenticateSuperAdmin, async (req, res) => {
    const { tenantId } = req.params;
    const { name, display_name, domain, logo_url, is_active } = req.body;

    try {
        // Check if tenant exists
        const existingTenant = await prisma.tenants.findUnique({
            where: { tennat_id: tenantId }
        });

        if (!existingTenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Update tenant
        const updatedTenant = await prisma.tenants.update({
            where: { tennat_id: tenantId },
            data: {
                ...(name && { name }),
                ...(display_name && { display_name }),
                ...(domain !== undefined && { domain }),
                ...(logo_url !== undefined && { logo_url }),
                ...(is_active !== undefined && { is_active })
            }
        });

        res.json({
            message: 'Tenant updated successfully',
            tenant: {
                id: updatedTenant.tennat_id,
                name: updatedTenant.name,
                display_name: updatedTenant.display_name,
                domain: updatedTenant.domain,
                logo_url: updatedTenant.logo_url,
                is_active: updatedTenant.is_active,
                updated_at: updatedTenant.updated_at
            }
        });

    } catch (error) {
        console.error('Update tenant error:', error);
        res.status(500).json({ error: 'Failed to update tenant' });
    }
});

// Create Admin and Assign to Tenant (Super Admin Only)
router.post('/tenants/:tenantId/admins', authenticateSuperAdmin, async (req, res) => {
    const { tenantId } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    try {
        // Check if tenant exists
        const tenant = await prisma.tenants.findUnique({
            where: { tennat_id: tenantId }
        });

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Check if admin with this email already exists for this tenant
        const existingAdmin = await prisma.admins.findFirst({
            where: { 
                email,
                tenant_id: tenantId
            }
        });

        if (existingAdmin) {
            return res.status(409).json({ error: 'Admin with this email already exists for this tenant' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        const admin = await prisma.admins.create({
            data: {
                name,
                email,
                password: hashedPassword,
                tenant_id: tenantId
            }
        });

        res.status(201).json({
            message: 'Admin created and assigned to tenant successfully',
            admin: {
                id: admin.aid,
                name: admin.name,
                email: admin.email,
                tenant_id: admin.tenant_id
            }
        });

    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

// Assign Existing Admin to Tenant (Super Admin Only)
router.post('/tenants/:tenantId/assign-admin', authenticateSuperAdmin, async (req, res) => {
    const { tenantId } = req.params;
    const { adminId } = req.body;

    if (!adminId) {
        return res.status(400).json({ error: 'Admin ID is required' });
    }

    try {
        // Check if tenant exists
        const tenant = await prisma.tenants.findUnique({
            where: { tennat_id: tenantId }
        });

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Check if admin exists
        const admin = await prisma.admins.findUnique({
            where: { aid: adminId }
        });

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Check if admin is already assigned to this tenant
        if (admin.tenant_id === tenantId) {
            return res.status(409).json({ error: 'Admin is already assigned to this tenant' });
        }

        // Update admin's tenant assignment
        const updatedAdmin = await prisma.admins.update({
            where: { aid: adminId },
            data: { tenant_id: tenantId }
        });

        res.json({
            message: 'Admin assigned to tenant successfully',
            admin: {
                id: updatedAdmin.aid,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                tenant_id: updatedAdmin.tenant_id
            }
        });

    } catch (error) {
        console.error('Assign admin error:', error);
        res.status(500).json({ error: 'Failed to assign admin to tenant' });
    }
});

// Get All Admins (Super Admin Only)
router.get('/admins', authenticateSuperAdmin, async (req, res) => {
    try {
        const admins = await prisma.admins.findMany({
            include: {
                tenant: {
                    select: {
                        tennat_id: true,
                        name: true,
                        display_name: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        const adminsWithTenant = admins.map(admin => ({
            id: admin.aid,
            name: admin.name,
            email: admin.email,
            tenant: admin.tenant ? {
                id: admin.tenant.tennat_id,
                name: admin.tenant.name,
                display_name: admin.tenant.display_name
            } : null
        }));

        res.json(adminsWithTenant);

    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
});

// Remove Admin from Tenant (Super Admin Only)
router.delete('/tenants/:tenantId/admins/:adminId', authenticateSuperAdmin, async (req, res) => {
    const { tenantId, adminId } = req.params;

    try {
        // Check if admin exists and is assigned to the specified tenant
        const admin = await prisma.admins.findFirst({
            where: {
                aid: adminId,
                tenant_id: tenantId
            }
        });

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found or not assigned to this tenant' });
        }

        // Remove admin from tenant (set tenant_id to null)
        await prisma.admins.update({
            where: { aid: adminId },
            data: { tenant_id: null }
        });

        res.json({ message: 'Admin removed from tenant successfully' });

    } catch (error) {
        console.error('Remove admin error:', error);
        res.status(500).json({ error: 'Failed to remove admin from tenant' });
    }
});

// Dashboard Stats (Super Admin Only)
router.get('/dashboard', authenticateSuperAdmin, async (req, res) => {
    try {
        const [
            totalTenants,
            activeTenants,
            totalAdmins,
            totalClients,
            totalServices,
            totalAppointments
        ] = await Promise.all([
            prisma.tenants.count(),
            prisma.tenants.count({ where: { is_active: true } }),
            prisma.admins.count(),
            prisma.clients.count(),
            prisma.services.count(),
            prisma.appointments.count()
        ]);

        res.json({
            stats: {
                totalTenants,
                activeTenants,
                inactiveTenants: totalTenants - activeTenants,
                totalAdmins,
                totalClients,
                totalServices,
                totalAppointments
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

export default router;
