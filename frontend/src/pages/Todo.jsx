import { useCallback, useEffect, useState } from "react";
import todoService from "../services/todoService";

export default function Todo() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const getErrorMessage = (err) =>
    err.response?.data?.message || err.message || "Something went wrong.";

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await todoService.getAll();
      setTodos(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setError("Please enter a todo title.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        title: cleanTitle,
        description: description.trim(),
      };

      if (editingId !== null) {
        const updated = await todoService.update(editingId, payload);

        setTodos((current) =>
          current.map((todo) =>
            todo.id === editingId ? updated : todo
          )
        );
      } else {
        const created = await todoService.create(payload);

        setTodos((current) => [created, ...current]);
      }

      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function startEditing(todo) {
    setEditingId(todo.id);
    setTitle(todo.title);
    setDescription(todo.description || "");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleTodo(todo) {
    setError("");

    try {
      const updated = await todoService.update(todo.id, {
        title: todo.title,
        description: todo.description || "",
        completed: !Boolean(todo.completed),
      });

      setTodos((current) =>
        current.map((item) =>
          item.id === todo.id ? updated : item
        )
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function deleteTodo(id) {
    if (!window.confirm("Are you sure you want to delete this todo?")) {
      return;
    }

    setError("");

    try {
      await todoService.delete(id);

      setTodos((current) =>
        current.filter((todo) => todo.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const completedCount = todos.filter(
    (todo) => Boolean(todo.completed)
  ).length;

  const activeCount = todos.length - completedCount;

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !Boolean(todo.completed);
    if (filter === "completed") return Boolean(todo.completed);
    return true;
  });

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="todo-container">
        <header className="topbar">
          <a className="brand" href="#" aria-label="Taskflow home">
            <span className="brand-icon">✓</span>
            <span>taskflow<span className="brand-dot">.</span></span>
          </a>

          <span className="environment-badge">
            <span className="status-dot" />
            CRUD Playground
          </span>
        </header>

        <section className="hero">
          <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
          <h1>
            Make room for<br />
            <span>what matters.</span>
          </h1>
          <p className="hero-copy">
            Small steps, big progress. Keep your tasks organized
            and get things done, one at a time.
          </p>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-label">Total tasks</span>
            <strong>{todos.length}</strong>
            <span className="stat-icon purple">▤</span>
          </article>

          <article className="stat-card">
            <span className="stat-label">In progress</span>
            <strong>{activeCount}</strong>
            <span className="stat-icon blue">◷</span>
          </article>

          <article className="stat-card">
            <span className="stat-label">Completed</span>
            <strong>{completedCount}</strong>
            <span className="stat-icon green">✓</span>
          </article>
        </section>

        <section className="composer card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                {editingId !== null ? "UPDATE TASK" : "NEW TASK"}
              </span>
              <h2>
                {editingId !== null ? "Edit your task" : "Add a new task"}
              </h2>
            </div>

            <span className="heading-mark">
              {editingId !== null ? "✎" : "+"}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="todo-title">Task title</label>
            <input
              id="todo-title"
              type="text"
              placeholder="e.g. Finish my project..."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              required
            />

            <label htmlFor="todo-description">
              Description <span>(optional)</span>
            </label>
            <textarea
              id="todo-description"
              placeholder="Add a few details..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={2000}
            />

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}

            <div className="form-actions">
              {editingId !== null && (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

              <button
                className="button button-primary"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Save changes"
                    : "+ Create task"}
              </button>
            </div>
          </form>
        </section>

        <section className="tasks-section">
          <div className="tasks-heading">
            <div>
              <span className="section-kicker">STAY ON TRACK</span>
              <h2>
                Your tasks <span className="count-pill">{todos.length}</span>
              </h2>
            </div>

            <div className="filters" aria-label="Filter tasks">
              {["all", "active", "completed"].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`filter-button ${
                    filter === value ? "selected" : ""
                  }`}
                  onClick={() => setFilter(value)}
                >
                  {value[0].toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <span className="empty-icon">◌</span>
              <h3>Loading your tasks...</h3>
              <p>Connecting to your API.</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">
                {filter === "completed" ? "✓" : "✦"}
              </span>
              <h3>
                {todos.length === 0
                  ? "A fresh start."
                  : "Nothing here yet."}
              </h3>
              <p>
                {todos.length === 0
                  ? "Create your first task and get the ball rolling."
                  : "Try another filter to find your tasks."}
              </p>
            </div>
          ) : (
            <div className="task-list">
              {filteredTodos.map((todo) => (
                <article
                  className={`task-card ${
                    todo.completed ? "task-completed" : ""
                  }`}
                  key={todo.id}
                >
                  <button
                    type="button"
                    className={`task-check ${
                      todo.completed ? "checked" : ""
                    }`}
                    aria-label={
                      todo.completed ? "Mark as active" : "Mark as completed"
                    }
                    onClick={() => toggleTodo(todo)}
                  >
                    {todo.completed ? "✓" : ""}
                  </button>

                  <div className="task-content">
                    <h3>{todo.title}</h3>

                    {todo.description && <p>{todo.description}</p>}

                    <span
                      className={`task-status ${
                        todo.completed ? "done" : ""
                      }`}
                    >
                      <span />
                      {todo.completed ? "Completed" : "In progress"}
                    </span>
                  </div>

                  <div className="task-actions">
                    <button
                      type="button"
                      className="icon-button edit-button"
                      aria-label="Edit task"
                      title="Edit"
                      onClick={() => startEditing(todo)}
                    >
                      ✎
                    </button>

                    <button
                      type="button"
                      className="icon-button delete-button"
                      aria-label="Delete task"
                      title="Delete"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      ×
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="app-footer">
          <span>Built for focus, powered by your API.</span>
          <span>ONE TASK AT A TIME ✦</span>
        </footer>
      </section>
    </main>
  );
}
