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
//=== CATEGORIES ===
console.log("Categories route loaded");
app.get("/categories", auth, async (req, res) => {
  try {
    const result = await pool.query(
      ` 

 SELECT * 

 FROM categories 

 WHERE user_id = $1 

 ORDER BY name 

 `,

      [req.user.id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).send("Помилка завантаження категорій");
  }
});

//  ====ENTRIES====

app.post("/entries", auth, async (req, res) => {
  const { title, content, category_id } = req.body;
  try {
    await pool.query(
      "INSERT INTO entries (user_id, title, content, category_id, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [req.user.id, title, content, category_id],
    );

    res.send("OK");
  } catch (err) {
    console.error("ERROR POST:", err);
    res.status(500).send("Ошибка");
  }
});

//app.get("/entries", async (req, res) => {
app.get("/entries", auth, async (req, res) => {
  try {
    //const result = await pool.query(
    //"SELECT * FROM entries WHERE user_id = $1 ORDER BY COALESCE(updated_at, created_at) DESC",
    //[req.user.id],
    //);
    const result = await pool.query(
      ` SELECT 

 e.*, 

 c.name AS category_name, 

 c.color AS category_color 

 FROM entries e 

 LEFT JOIN categories c 

 ON e.category_id = c.id 

 WHERE e.user_id = $1 

 ORDER BY COALESCE(e.updated_at, e.created_at) DESC 

 `,

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

//=== UPDATE ENTRY ===

app.put("/entries/:id", auth, async (req, res) => {
  const { title, content, category_id } = req.body;

  try {
    await pool.query(
      ` 

 UPDATE entries 

 SET
 
 title = $1,
 content = $2,
    category_id = $3,
 updated_at = CURRENT_TIMESTAMP

 WHERE id = $4 

 AND user_id = $5 

 `,

      [title, content, category_id, req.params.id, req.user.id],
    );

    res.send("Updated");
  } catch (err) {
    console.error("ERROR UPDATE:", err);

    res.status(500).send("Помилка оновлення");
  }
});
//=== CATEGORIES ===
app.post("/categories", auth, async (req, res) => {
  const { name, color } = req.body;

  try {
    await pool.query(
      ` 

 INSERT INTO categories 

 ( 

 user_id, 

 name, 

 color 

 ) 

 VALUES 

 ( 

 $1, 

 $2, 

 $3 

 ) 

 `,

      [req.user.id, name, color],
    );

    res.send("OK");
  } catch (err) {
    console.error(err);

    res.status(500).send("ERROR");
  }
});
//=== DELETE CATEGORY ===
app.delete("/categories/:id", auth, async (req, res) => {
  try {
    const used = await pool.query(
      ` 

 SELECT COUNT(*) AS cnt 

 FROM entries 

 WHERE category_id = $1 

 `,

      [req.params.id],
    );

    if (Number(used.rows[0].cnt) > 0) {
      return res.status(400).send("Категорія використовується в записах");
    }

    await pool.query(
      ` 

 DELETE FROM categories 

 WHERE id = $1 

 AND user_id = $2 

 `,

      [req.params.id, req.user.id],
    );

    res.send("Deleted");
  } catch (err) {
    console.error(err);

    res.status(500).send("Error");
  }
});
//=== UPDATE CATEGORY ===
app.put("/categories/:id", auth, async (req, res) => {
  const { name, color } = req.body;

  try {
    await pool.query(
      ` 

 UPDATE categories 

 SET 

 name = $1, 

 color = $2 

 WHERE id = $3 

 AND user_id = $4 

 `,

      [name, color, req.params.id, req.user.id],
    );

    res.send("Updated");
  } catch (err) {
    console.error(err);

    res.status(500).send("Error");
  }
});

//===SERVER====//

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
