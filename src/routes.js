const { createServer } = require('node:http');
const { createTaskController } = require('./taskController');

function createApp() {
  const taskController = createTaskController();

  return createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;

    if (req.method === 'GET' && path === '/tasks') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(taskController.listTasks()));
      return;
    }

    if (req.method === 'POST' && path === '/tasks') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const task = taskController.createTask(payload.titulo);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(task));
        } catch (error) {
          res.writeHead(error.statusCode || 500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    if (req.method === 'PATCH' && path.startsWith('/tasks/') && path.endsWith('/complete')) {
      const id = path.split('/')[2];
      try {
        const task = taskController.completeTask(id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(task));
      } catch (error) {
        res.writeHead(error.statusCode || 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }

    if (req.method === 'DELETE' && path.startsWith('/tasks/')) {
      const id = path.split('/')[2];
      try {
        const task = taskController.deleteTask(id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(task));
      } catch (error) {
        res.writeHead(error.statusCode || 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Rota não encontrada' }));
  });
}

module.exports = { createApp };
