#!/usr/bin/env node

/**
 * Quick Database Check Script
 * 
 * This script checks what database systems are available and working
 * in your LevelGG project.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 LevelGG Database System Check');
console.log('='.repeat(50));

// Check for environment files
console.log('\n📁 Environment Files:');
const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
envFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`  ✅ ${file} - Found`);
        try {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('SUPABASE')) {
                console.log(`    📊 Contains Supabase configuration`);
            }
            if (content.includes('DATABASE_URL')) {
                console.log(`    🐘 Contains Django database configuration`);
            }
        } catch (error) {
            console.log(`    ❌ Error reading file: ${error.message}`);
        }
    } else {
        console.log(`  ❌ ${file} - Not found`);
    }
});

// Check for Supabase configuration
console.log('\n🔗 Supabase Configuration:');
const supabaseFile = 'lib/supabase.ts';
if (fs.existsSync(supabaseFile)) {
    console.log(`  ✅ ${supabaseFile} - Found`);
    const content = fs.readFileSync(supabaseFile, 'utf8');
    if (content.includes('NEXT_PUBLIC_SUPABASE_URL')) {
        console.log(`    📊 Supabase client configured`);
    }
} else {
    console.log(`  ❌ ${supabaseFile} - Not found`);
}

// Check for Django backend
console.log('\n🐍 Django Backend:');
const djangoDir = 'backend';
if (fs.existsSync(djangoDir)) {
    console.log(`  ✅ ${djangoDir}/ - Found`);
    
    const managePy = path.join(djangoDir, 'manage.py');
    if (fs.existsSync(managePy)) {
        console.log(`    ✅ manage.py - Found`);
    }
    
    const requirements = path.join(djangoDir, 'requirements.txt');
    if (fs.existsSync(requirements)) {
        console.log(`    ✅ requirements.txt - Found`);
        const content = fs.readFileSync(requirements, 'utf8');
        if (content.includes('django')) {
            console.log(`    📦 Django in requirements`);
        }
    }
    
    const models = path.join(djangoDir, 'tournaments', 'models.py');
    if (fs.existsSync(models)) {
        console.log(`    ✅ models.py - Found`);
    }
} else {
    console.log(`  ❌ ${djangoDir}/ - Not found`);
}

// Check for database schema
console.log('\n🗄️ Database Schema:');
const schemaFile = 'database/schema.sql';
if (fs.existsSync(schemaFile)) {
    console.log(`  ✅ ${schemaFile} - Found`);
    const content = fs.readFileSync(schemaFile, 'utf8');
    if (content.includes('CREATE TABLE tournaments')) {
        console.log(`    📊 Contains tournament tables`);
    }
    if (content.includes('CREATE TABLE teams')) {
        console.log(`    👥 Contains team tables`);
    }
    if (content.includes('CREATE TABLE profiles')) {
        console.log(`    👤 Contains user profile tables`);
    }
} else {
    console.log(`  ❌ ${schemaFile} - Not found`);
}

// Check for test data
console.log('\n🧪 Test Data:');
const testDataDir = 'tests/database';
if (fs.existsSync(testDataDir)) {
    console.log(`  ✅ ${testDataDir}/ - Found`);
    
    const files = fs.readdirSync(testDataDir);
    files.forEach(file => {
        console.log(`    📄 ${file}`);
    });
} else {
    console.log(`  ❌ ${testDataDir}/ - Not found`);
}

// Check package.json for database-related scripts
console.log('\n📦 Package Scripts:');
const packageJson = 'package.json';
if (fs.existsSync(packageJson)) {
    try {
        const content = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
        const scripts = content.scripts || {};
        
        const dbScripts = Object.keys(scripts).filter(script => 
            script.includes('test') || script.includes('data') || script.includes('db')
        );
        
        if (dbScripts.length > 0) {
            console.log(`  📜 Database-related scripts:`);
            dbScripts.forEach(script => {
                console.log(`    npm run ${script}`);
            });
        } else {
            console.log(`  ❌ No database-related scripts found`);
        }
    } catch (error) {
        console.log(`  ❌ Error reading package.json: ${error.message}`);
    }
} else {
    console.log(`  ❌ ${packageJson} - Not found`);
}

// Recommendations
console.log('\n💡 Recommendations:');
console.log('='.repeat(50));

if (!fs.existsSync('.env.local')) {
    console.log('❌ No .env.local file found');
    console.log('   → Create .env.local with Supabase credentials');
    console.log('   → See DATABASE_SETUP.md for instructions');
}

if (fs.existsSync('backend') && !fs.existsSync('backend/venv')) {
    console.log('❌ Django backend found but no virtual environment');
    console.log('   → Run: cd backend && python -m venv venv');
    console.log('   → Then: source venv/bin/activate && pip install -r requirements.txt');
}

if (fs.existsSync('lib/supabase.ts') && !fs.existsSync('.env.local')) {
    console.log('❌ Supabase client configured but no environment variables');
    console.log('   → Set up Supabase project at https://supabase.com');
    console.log('   → Add credentials to .env.local');
}

console.log('\n🚀 Next Steps:');
console.log('1. Choose your database system (Supabase recommended)');
console.log('2. Follow the setup guide in DATABASE_SETUP.md');
console.log('3. Test your setup with: npm run test:data:summary');
console.log('4. Create your first tournament at: http://localhost:3000/battlefield/tournaments/create');

console.log('\n✨ Happy coding!');
