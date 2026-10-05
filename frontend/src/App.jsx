import { useEffect, useState } from "react";
import "./App.css";

const API = "/api/todos";
const JSON_HEADERS = { "Content-Type": "application/json" };

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");

  // Load todos once when the page opens
  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then(setTodos);
  }, []);

  async function addTodo(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch(API, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ title }),
    });
    const created = await res.json();
    setTodos([created, ...todos]);
    setTitle("");
  }

  async function toggleTodo(todo) {
    const res = await fetch(`${API}/${todo.id}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({ completed: !todo.completed }),
    });
    const updated = await res.json();
    setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
  }

  async function deleteTodo(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <main className="app">
      <h1>To-Do List</h1>

      <form className="add" onSubmit={addTodo}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add</button>
      </form>

      <ul className="list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "completed" : ""}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo)}
            />
            <span className="title">{todo.title}</span>
            <button className="delete" onClick={() => deleteTodo(todo.id)}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}