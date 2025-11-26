#!/usr/bin/env node
// Usage:
// node scripts/create_director.js "Name" "Nationality" 1970

const db = require('../database.js');

function usage() {
  console.log('Usage: node scripts/create_director.js "Name" "Nationality" 1970');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 1) {
  usage();
}

const name = args[0];
const nationality = args[1] || null;
const birth_year = args[2] ? Number(args[2]) : null;

if (!name) {
  console.error('Error: name is required');
  usage();
}

const director = { name, nationality, birth_year };

// Use the helper function in database.js
if (typeof db.createDirector !== 'function') {
  console.error('Error: createDirector function is not available in database.js');
  process.exit(1);
}

db.createDirector(director, (err, created) => {
  if (err) {
    console.error('Failed to create director:', err.message || err);
    process.exit(1);
  }
  console.log('Director created:', created);
  process.exit(0);
});
