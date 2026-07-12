const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const pool = require("./db");

app.use(cors());

app.use(express.json());
// ===== AUTH MIDDLEWARE =====

function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send("No token");
  }

  try {
    const decoded = jwt.verify(
      token,

      "my-secret-key",
    );

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
}
app.get("/", (req, res) => {
  res.send("API INPROCESS. Take your seats and enjoy the ride!");
});

// ====REGISTER====
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [
      email,
      hash,
    ]);
    res.send("User registered successfully");
  } catch (err) {
    console.error("ERROR REGISTER:", err);
    res.status(500).send("Error registering user");
  }
});

//  ====ENTRIES====

//app.post("/entries", async (req, res) => {
app.post("/entries", auth, async (req, res) => {
  const { content } = req.body;
  try {
    await pool.query("INSERT INTO entries (user_id, content) VALUES ($1, $2)", [
      req.user.id,
      content,
    ]);

    res.send("OK");
  } catch (err) {
    console.error("ERROR POST:", err);
    res.status(500).send("Ошибка");
  }
});

//app.get("/entries", async (req, res) => {
app.get("/entries", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM entries WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("ERROR GET:", err);
    res.status(500).send("Ошибка");
  }
});
//====LOGIN====//
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",

      [email],
    );

    if (result.rows.length === 0) {
      return res.status(400).send("Пользователь не найден");
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(
      password,

      user.password,
    );

    if (!valid) {
      return res.status(400).send("Неверный пароль");
    }

    const token = jwt.sign(
      { id: user.id },

      "my-secret-key",
    );

    res.json({ token });
  } catch (err) {
    console.error("ERROR LOGIN:", err);

    res.status(500).send("Ошибка логина");
  }
});

app.delete("/entries/:id", auth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM entries WHERE id = $1 AND user_id = $2",

      [req.params.id, req.user.id],
    );

    res.send("Deleted");
  } catch (err) {
    console.error("ERROR DELETE:", err);

    res.status(500).send("Ошибка удаления");
  }
});

/===SERVER====/;
app.listen(5000, () => {
  console.log("Server started on port 5000");
});
