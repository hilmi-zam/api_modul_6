const sqlite3 = require('sqlite3').verbose();
const DB = './movies.db';

const db = new sqlite3.Database(DB, (err) => {
  if (err) {
    console.error('Failed to open DB:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  console.log('Checking users table schema...');
  db.all("PRAGMA table_info(users)", (err, cols) => {
    if (err) {
      console.error('Error reading table info:', err.message);
      db.close();
      return;
    }

    const hasEmail = cols.some(c => c.name === 'email');
    if (hasEmail) {
      console.log('Column `email` already exists. No ALTER needed.');
    } else {
      console.log('Adding column `email` to users table...');
      db.run("ALTER TABLE users ADD COLUMN email TEXT", (err) => {
        if (err) {
          console.error('Error adding column:', err.message);
        } else {
          console.log('Column added.');
        }
      });
    }

    // Try to create a unique index on email (will fail if duplicates exist)
    console.log('Creating unique index on email (if not exists)...');
    db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)", (err) => {
      if (err) {
        console.error('Error creating unique index:', err.message);
      } else {
        console.log('Unique index ensured on users(email).');
      }

      // Show current schema
      db.all("PRAGMA table_info(users)", (err2, newCols) => {
        if (!err2) console.log('users table columns:', newCols.map(c => ({name: c.name, type: c.type}))); 
        db.close();
      });
    });
  });
});
