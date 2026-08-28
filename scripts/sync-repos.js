const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// Sub-path definitions for sync
const BACKEND_SOURCE = path.join(rootDir, 'apps', 'api');
const BACKEND_TARGETS = [
  { path: path.join(rootDir, 'backend'), provider: 'mysql' },
  { path: path.join(rootDir, 'prodaction', 'note-Expenses-backend'), provider: 'postgresql' },
];

const FRONTEND_SOURCE = path.join(rootDir, 'apps', 'web');
const FRONTEND_TARGETS = [
  path.join(rootDir, 'frontend'),
  path.join(rootDir, 'prodaction', 'note-Expenses-frontend'),
];

// Folders/files to sync for backend
const BACKEND_ITEMS = ['src', 'public', 'assets', 'tests', 'docs'];

// Folders/files to sync for frontend
const FRONTEND_ITEMS = ['app', 'components', 'lib', 'public', 'types', 'hooks'];

// Ignore lists
const IGNORED_NAMES = ['.git', 'node_modules', '.next', 'dist', '.cache', 'uploads', '.DS_Store'];

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      if (IGNORED_NAMES.includes(childItemName)) return;
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else if (exists) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

function fixSharedImportsInBackend(destSrcDir) {
  const sharedSrcDir = path.join(rootDir, 'packages', 'shared', 'src');
  const targetSharedDir = path.join(destSrcDir, 'shared');
  copyRecursiveSync(sharedSrcDir, targetSharedDir);

  function rewriteImports(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        rewriteImports(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.js')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('@expense-system/shared')) {
          const fileDir = path.dirname(fullPath);
          let relPath = path.relative(fileDir, targetSharedDir).replace(/\\/g, '/');
          if (!relPath.startsWith('.')) {
            relPath = './' + relPath;
          }
          content = content.replace(/['"]@expense-system\/shared['"]/g, `'${relPath}'`);
          fs.writeFileSync(fullPath, content, 'utf8');
        }
      }
    }
  }

  rewriteImports(destSrcDir);
}

function syncBackend() {
  console.log('🔄 [1/2] Syncing Backend repositories...');
  for (const target of BACKEND_TARGETS) {
    const targetDir = target.path;
    if (!fs.existsSync(targetDir)) {
      console.warn(`⚠️ Target directory not found, skipping: ${targetDir}`);
      continue;
    }

    // Sync source code directories
    for (const item of BACKEND_ITEMS) {
      const srcPath = path.join(BACKEND_SOURCE, item);
      const destPath = path.join(targetDir, item);

      if (fs.existsSync(srcPath)) {
        copyRecursiveSync(srcPath, destPath);
        console.log(`  ✅ Synced Backend: ${item} -> ${path.relative(rootDir, destPath)}`);
      }
    }

    // Embed & adapt shared package into standalone backend src
    const destSrcDir = path.join(targetDir, 'src');
    fixSharedImportsInBackend(destSrcDir);
    console.log(`  ✅ Embedded & Adapted Shared package into standalone src -> ${path.relative(rootDir, destSrcDir)}`);

    // Sync & adapt prisma/schema.prisma for target DB Provider (MySQL vs PostgreSQL)
    const schemaSrc = path.join(BACKEND_SOURCE, 'prisma', 'schema.prisma');
    const schemaDestDir = path.join(targetDir, 'prisma');
    const schemaDest = path.join(schemaDestDir, 'schema.prisma');

    if (fs.existsSync(schemaSrc)) {
      if (!fs.existsSync(schemaDestDir)) {
        fs.mkdirSync(schemaDestDir, { recursive: true });
      }

      let schemaContent = fs.readFileSync(schemaSrc, 'utf8');

      if (target.provider === 'postgresql') {
        schemaContent = schemaContent.replace(
          /provider\s*=\s*"mysql"/g,
          'provider = "postgresql"'
        );
      } else if (target.provider === 'mysql') {
        schemaContent = schemaContent.replace(
          /provider\s*=\s*"postgresql"/g,
          'provider = "mysql"'
        );
      }

      fs.writeFileSync(schemaDest, schemaContent, 'utf8');
      console.log(`  ✅ Synced & Adapted Prisma Schema (provider: ${target.provider}) -> ${path.relative(rootDir, schemaDest)}`);
    }

    // Sync prisma/seed.ts
    const seedSrc = path.join(BACKEND_SOURCE, 'prisma', 'seed.ts');
    const seedDest = path.join(targetDir, 'prisma', 'seed.ts');
    if (fs.existsSync(seedSrc)) {
      copyRecursiveSync(seedSrc, seedDest);
      console.log(`  ✅ Synced Backend: prisma/seed.ts -> ${path.relative(rootDir, seedDest)}`);
    }
  }
}

function syncFrontend() {
  console.log('🔄 [2/2] Syncing Frontend repositories...');
  for (const targetDir of FRONTEND_TARGETS) {
    if (!fs.existsSync(targetDir)) {
      console.warn(`⚠️ Target directory not found, skipping: ${targetDir}`);
      continue;
    }

    for (const item of FRONTEND_ITEMS) {
      const srcPath = path.join(FRONTEND_SOURCE, item);
      const destPath = path.join(targetDir, item);

      if (fs.existsSync(srcPath)) {
        copyRecursiveSync(srcPath, destPath);
        console.log(`  ✅ Synced Frontend: ${item} -> ${path.relative(rootDir, destPath)}`);
      }
    }
  }
}

console.log('==================================================');
console.log('🚀 Starting Automatic Workspace Repository Sync (with Multi-DB Schema Adapter)');
console.log('==================================================');

try {
  syncBackend();
  syncFrontend();
  console.log('==================================================');
  console.log('✨ All repositories synced & database schemas adapted successfully!');
  console.log('==================================================');
} catch (error) {
  console.error('❌ Error during synchronization:', error);
  process.exit(1);
}
