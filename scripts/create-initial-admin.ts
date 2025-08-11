import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createInitialAdmin() {
  try {
    console.log('🔐 Creating initial admin user...');

    // Check if admin already exists
    const existingAdmin = await prisma.users.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.users.create({
      data: {
        email: 'admin@rypm.com',
        password: hashedPassword,
        first_name: 'Super',
        last_name: 'Admin',
        role: 'ADMIN',
        is_active: true,
      },
    });

    console.log('✅ Admin user created successfully:', admin.email);
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createInitialAdmin(); 