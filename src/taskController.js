function createTaskController() {
  const tasks = [];
  let nextId = 1;

  function listTasks() {
    return tasks.map((task) => ({ ...task }));
  }

  function createTask(title) {
    if (typeof title !== 'string' || !title.trim()) {
      const error = new Error('Título da tarefa é obrigatório');
      error.statusCode = 400;
      throw error;
    }

    const task = {
      id: nextId++,
      titulo: title.trim(),
      concluida: false,
    };

    tasks.push(task);
    return { ...task };
  }

  function completeTask(id) {
    const task = tasks.find((item) => item.id === Number(id));

    if (!task) {
      const error = new Error('Tarefa não encontrada');
      error.statusCode = 404;
      throw error;
    }

    task.concluida = true;
    return { ...task };
  }

  function deleteTask(id) {
    const index = tasks.findIndex((item) => item.id === Number(id));

    if (index === -1) {
      const error = new Error('Tarefa não encontrada');
      error.statusCode = 404;
      throw error;
    }

    const [removedTask] = tasks.splice(index, 1);
    return { ...removedTask };
  }

  return {
    listTasks,
    createTask,
    completeTask,
    deleteTask,
  };
}

module.exports = {
  createTaskController,
};
