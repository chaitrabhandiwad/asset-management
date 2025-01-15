const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "..", "data.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin','manager','employee')),
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cars (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vin TEXT NOT NULL UNIQUE,
  plate TEXT NOT NULL UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','assigned','maintenance','retired')),
  location TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  purpose TEXT,
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (car_id) REFERENCES cars(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS maintenance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  mileage INTEGER,
  cost REAL,
  notes TEXT,
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (car_id) REFERENCES cars(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
`);

const seedAdmin = () => {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@company.local");
  if (existing) return;
  const passwordHash = bcrypt.hashSync("admin123", 10);
  db.prepare(
    "INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)"
  ).run("Admin", "admin@company.local", "admin", passwordHash);
};

seedAdmin();

module.exports = db;
