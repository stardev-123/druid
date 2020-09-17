const pgp = require('pg-promise')({});

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error('No DATABASE_URL env var found');
  process.exit(1);
}

const db = pgp({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.connect = client => {
  console.log('Connected to database:', client.connectionParameters.database);
};

module.exports = db;
