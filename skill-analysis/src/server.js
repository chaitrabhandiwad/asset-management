const path = require("path");
const express = require("express");
const session = require("express-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
const port = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  return next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  if (!roles.includes(req.session.user.role)) return res.status(403).send("Forbidden");
  return next();
};

const getUserByEmail = (email) =>
  db.prepare("SELECT id, name, email, role, password_hash FROM users WHERE email = ?").get(email);

const getUserById = (id) =>
  db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(id);

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.render("login", { error: "Invalid credentials" });
  }
  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  return res.redirect("/");
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

app.get("/", requireAuth, (req, res) => {
  const counts = {
    cars: db.prepare("SELECT COUNT(*) AS count FROM cars").get().count,
    assignments: db.prepare("SELECT COUNT(*) AS count FROM assignments WHERE end_date IS NULL").get().count,
    maintenance: db.prepare("SELECT COUNT(*) AS count FROM maintenance").get().count,
  };
  const activeAssignments = db
    .prepare(
      `SELECT a.id, a.start_date, a.purpose, c.plate, c.make, c.model, u.name AS driver
       FROM assignments a
       JOIN cars c ON c.id = a.car_id
       JOIN users u ON u.id = a.user_id
       WHERE a.end_date IS NULL
       ORDER BY a.start_date DESC
       LIMIT 5`
    )
    .all();

  res.render("dashboard", { counts, activeAssignments });
});

app.get("/cars", requireAuth, (req, res) => {
  const cars = db
    .prepare(
      `SELECT c.*, a.user_id, u.name AS driver
       FROM cars c
       LEFT JOIN assignments a ON a.car_id = c.id AND a.end_date IS NULL
       LEFT JOIN users u ON u.id = a.user_id
       ORDER BY c.id DESC`
    )
    .all();
  res.render("cars/index", { cars });
});

app.get("/cars/new", requireRole("admin", "manager"), (req, res) => {
  res.render("cars/new", { error: null });
});

app.post("/cars", requireRole("admin", "manager"), (req, res) => {
  const { vin, plate, make, model, year, location, notes } = req.body;
  try {
    db.prepare(
      `INSERT INTO cars (vin, plate, make, model, year, location, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(vin, plate, make, model, Number(year), location || null, notes || null);
    return res.redirect("/cars");
  } catch (err) {
    return res.render("cars/new", { error: "VIN or plate already exists" });
  }
});

app.get("/cars/:id", requireAuth, (req, res) => {
  const car = db.prepare("SELECT * FROM cars WHERE id = ?").get(req.params.id);
  if (!car) return res.status(404).send("Not found");
  const assignments = db
    .prepare(
      `SELECT a.*, u.name AS driver
       FROM assignments a
       JOIN users u ON u.id = a.user_id
       WHERE a.car_id = ?
       ORDER BY a.start_date DESC`
    )
    .all(req.params.id);
  const maintenance = db
    .prepare(
      `SELECT m.*, u.name AS created_by_name
       FROM maintenance m
       JOIN users u ON u.id = m.created_by
       WHERE m.car_id = ?
       ORDER BY m.date DESC`
    )
    .all(req.params.id);
  res.render("cars/show", { car, assignments, maintenance });
});

app.post("/cars/:id/update", requireRole("admin", "manager"), (req, res) => {
  const { status, location, notes } = req.body;
  db.prepare("UPDATE cars SET status = ?, location = ?, notes = ? WHERE id = ?").run(
    status,
    location || null,
    notes || null,
    req.params.id
  );
  res.redirect(`/cars/${req.params.id}`);
});

app.post("/cars/:id/delete", requireRole("admin"), (req, res) => {
  db.prepare("DELETE FROM cars WHERE id = ?").run(req.params.id);
  res.redirect("/cars");
});

app.get("/assignments", requireAuth, (req, res) => {
  const assignments = db
    .prepare(
      `SELECT a.*, c.plate, c.make, c.model, u.name AS driver
       FROM assignments a
       JOIN cars c ON c.id = a.car_id
       JOIN users u ON u.id = a.user_id
       ORDER BY a.start_date DESC`
    )
    .all();
  res.render("assignments/index", { assignments });
});

app.get("/assignments/new", requireRole("admin", "manager"), (req, res) => {
  const cars = db
    .prepare("SELECT * FROM cars WHERE status IN ('available','assigned') ORDER BY plate")
    .all();
  const users = db.prepare("SELECT id, name, role FROM users ORDER BY name").all();
  res.render("assignments/new", { cars, users, error: null });
});

app.post("/assignments", requireRole("admin", "manager"), (req, res) => {
  const { car_id, user_id, start_date, purpose } = req.body;
  const active = db
    .prepare("SELECT id FROM assignments WHERE car_id = ? AND end_date IS NULL")
    .get(car_id);
  if (active) {
    const cars = db.prepare("SELECT * FROM cars ORDER BY plate").all();
    const users = db.prepare("SELECT id, name, role FROM users ORDER BY name").all();
    return res.render("assignments/new", {
      cars,
      users,
      error: "This car is already assigned. Return it before reassigning.",
    });
  }
  db.prepare(
    `INSERT INTO assignments (car_id, user_id, start_date, purpose, created_by)
     VALUES (?, ?, ?, ?, ?)`
  ).run(car_id, user_id, start_date, purpose || null, req.session.user.id);
  db.prepare("UPDATE cars SET status = 'assigned' WHERE id = ?").run(car_id);
  return res.redirect("/assignments");
});

app.post("/assignments/:id/return", requireRole("admin", "manager"), (req, res) => {
  const assignment = db.prepare("SELECT car_id FROM assignments WHERE id = ?").get(req.params.id);
  if (!assignment) return res.status(404).send("Not found");
  db.prepare("UPDATE assignments SET end_date = date('now') WHERE id = ?").run(req.params.id);
  db.prepare("UPDATE cars SET status = 'available' WHERE id = ?").run(assignment.car_id);
  res.redirect("/assignments");
});

app.get("/maintenance", requireAuth, (req, res) => {
  const maintenance = db
    .prepare(
      `SELECT m.*, c.plate, c.make, c.model, u.name AS created_by_name
       FROM maintenance m
       JOIN cars c ON c.id = m.car_id
       JOIN users u ON u.id = m.created_by
       ORDER BY m.date DESC`
    )
    .all();
  res.render("maintenance/index", { maintenance });
});

app.get("/maintenance/new", requireRole("admin", "manager"), (req, res) => {
  const cars = db.prepare("SELECT * FROM cars ORDER BY plate").all();
  res.render("maintenance/new", { cars, error: null });
});

app.post("/maintenance", requireRole("admin", "manager"), (req, res) => {
  const { car_id, type, date, mileage, cost, notes } = req.body;
  db.prepare(
    `INSERT INTO maintenance (car_id, type, date, mileage, cost, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    car_id,
    type,
    date,
    mileage ? Number(mileage) : null,
    cost ? Number(cost) : null,
    notes || null,
    req.session.user.id
  );
  res.redirect("/maintenance");
});

app.get("/users", requireRole("admin"), (req, res) => {
  const users = db.prepare("SELECT id, name, email, role, created_at FROM users ORDER BY id DESC").all();
  res.render("users/index", { users });
});

app.get("/users/new", requireRole("admin"), (req, res) => {
  res.render("users/new", { error: null });
});

app.post("/users", requireRole("admin"), (req, res) => {
  const { name, email, role, password } = req.body;
  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    db.prepare(
      "INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)"
    ).run(name, email, role, passwordHash);
    res.redirect("/users");
  } catch (err) {
    res.render("users/new", { error: "Email already exists" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
