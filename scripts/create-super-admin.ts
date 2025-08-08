import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('Creating super admin...');

    // Check if super admin already exists
    const existingSuperAdmin = await prisma.admin.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists:', existingSuperAdmin.email);
      return;
    }

    // Create super admin
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin = await prisma.admin.create({
      data: {
        email: 'superadmin@rypm.com',
        password: superAdminPassword,
        first_name: 'Super',
        last_name: 'Admin',
        role: 'SUPER_ADMIN',
        is_active: true,
      },
    });

    console.log('✅ Super admin created successfully!');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔑 Password: superadmin123');
    console.log('👑 Role: SUPER_ADMIN');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Login with super admin credentials');
    console.log('2. Use the super admin to create agents');
    console.log('3. Agents will handle tenant interactions');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin(); 