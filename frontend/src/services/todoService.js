import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const todoService = {
  getAll() {
    return api.get("/todos").then((response) => response.data);
  },

  create(todo) {
    return api.post("/todos", todo).then((response) => response.data);
  },

  update(id, todo) {
    return api.put(`/todos/${id}`, todo).then((response) => response.data);
  },

  delete(id) {
    return api.delete(`/todos/${id}`).then((response) => response.data);
  },
};

export default todoService;
