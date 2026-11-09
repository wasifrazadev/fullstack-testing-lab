import api from "./api";

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
