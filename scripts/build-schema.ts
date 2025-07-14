import * as fs from 'fs';
import * as path from 'path';

const base = fs.readFileSync(path.join(__dirname, '../prisma/base.prisma'), 'utf-8');
const modelDir = path.join(__dirname, '../prisma/models');
const modelFiles = fs.readdirSync(modelDir).filter(file => file.endsWith('.prisma'));

const models = modelFiles
  .map(file => fs.readFileSync(path.join(modelDir, file), 'utf-8'))
  .join('\n\n');

const finalSchema = `${base}\n\n${models}`;

fs.writeFileSync(path.join(__dirname, '../prisma/schema.prisma'), finalSchema);
console.log('✅ schema.prisma built successfully.'); 