require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
}));

app.use(express.json());

// Normalize MySQL values for consistent API responses.
function formatTodo(todo) {
  return {
    ...todo,
    completed: Boolean(todo.completed),
  };
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Todo API is running",
  });
});

// GET: Fetch all todos
app.get("/api/todos", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, title, description, completed, created_at, updated_at
       FROM todos
       ORDER BY created_at DESC, id DESC`
    );

    res.json(rows.map(formatTodo));
  } catch (error) {
    next(error);
  }
});

// POST: Create a todo
app.post("/api/todos", async (req, res, next) => {
  try {
    const title = typeof req.body.title === "string"
      ? req.body.title.trim()
      : "";

    const description = typeof req.body.description === "string"
      ? req.body.description.trim()
      : "";

    if (!title) {
      return res.status(400).json({
        message: "Todo title is required.",
      });
    }

    if (title.length > 200 || description.length > 2000) {
      return res.status(400).json({
        message: "Title or description exceeds the allowed length.",
      });
    }

    const [result] = await pool.execute(
      "INSERT INTO todos (title, description) VALUES (?, ?)",
      [title, description || null]
    );

    const [rows] = await pool.execute(
      `SELECT id, title, description, completed, created_at, updated_at
       FROM todos WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(formatTodo(rows[0]));
  } catch (error) {
    next(error);
  }
});

// PUT: Update a todo
app.put("/api/todos/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid todo ID.",
      });
    }

    const [existingRows] = await pool.execute(
      "SELECT * FROM todos WHERE id = ?",
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: "Todo not found.",
      });
    }

    const existing = existingRows[0];

    const title = req.body.title === undefined
      ? existing.title
      : typeof req.body.title === "string"
        ? req.body.title.trim()
        : "";

    const description = req.body.description === undefined
      ? existing.description
      : typeof req.body.description === "string"
        ? req.body.description.trim() || null
        : null;

    const completed = req.body.completed === undefined
      ? Boolean(existing.completed)
      : req.body.completed;

    if (!title) {
      return res.status(400).json({
        message: "Todo title is required.",
      });
    }

    if (title.length > 200) {
      return res.status(400).json({
        message: "Title must not exceed 200 characters.",
      });
    }

    if (description !== null &&
        (typeof description !== "string" || description.length > 2000)) {
      return res.status(400).json({
        message: "Description must not exceed 2000 characters.",
      });
    }

    if (typeof completed !== "boolean") {
      return res.status(400).json({
        message: "Completed must be true or false.",
      });
    }

    await pool.execute(
      `UPDATE todos
       SET title = ?, description = ?, completed = ?
       WHERE id = ?`,
      [title, description, completed, id]
    );

    const [updatedRows] = await pool.execute(
      `SELECT id, title, description, completed, created_at, updated_at
       FROM todos WHERE id = ?`,
      [id]
    );

    res.json(formatTodo(updatedRows[0]));
  } catch (error) {
    next(error);
  }
});

// DELETE: Delete a todo
app.delete("/api/todos/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid todo ID.",
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM todos WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Todo not found.",
      });
    }

    res.status(200).json({
      message: "Todo deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
});

// Central error handler
app.use((error, req, res, next) => {
  console.error("API error:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    message: "Internal server error.",
  });
});

// Verify DB connection before starting the server.
async function startServer() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    app.listen(PORT, () => {
      console.log(`Todo API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not connect to MySQL:", error.message);
    process.exit(1);
  }
}

startServer();
