const http = require('node:http');
const { createApp } = require('../src/routes');

function request(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const options = {
      hostname: '127.0.0.1',
      port: address.port,
      path,
      method,
      headers: body ? { 'content-type': 'application/json' } : {},
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function startServer() {
  const server = createApp();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return server;
}

describe('API de tarefas', () => {
  test('GET /tasks retorna a lista vazia inicialmente', async () => {
    const server = await startServer();

    try {
      const response = await request(server, 'GET', '/tasks');

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual([]);
    } finally {
      server.close();
    }
  });

  test('POST /tasks cria uma tarefa e a lista a exibe', async () => {
    const server = await startServer();

    try {
      const createResponse = await request(server, 'POST', '/tasks', { titulo: 'Estudar DevOps' });

      expect(createResponse.statusCode).toBe(201);
      const createdTask = JSON.parse(createResponse.body);
      expect(createdTask.titulo).toBe('Estudar DevOps');
      expect(createdTask.concluida).toBe(false);

      const listResponse = await request(server, 'GET', '/tasks');
      const tasks = JSON.parse(listResponse.body);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(createdTask.id);
    } finally {
      server.close();
    }
  });

  test('PATCH /tasks/:id/complete marca a tarefa como concluída', async () => {
    const server = await startServer();

    try {
      const createdResponse = await request(server, 'POST', '/tasks', { titulo: 'Enviar trabalho' });
      const taskId = JSON.parse(createdResponse.body).id;

      const response = await request(server, 'PATCH', `/tasks/${taskId}/complete`);

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).concluida).toBe(true);
    } finally {
      server.close();
    }
  });

  test('DELETE /tasks/:id remove a tarefa da lista', async () => {
    const server = await startServer();

    try {
      const createdResponse = await request(server, 'POST', '/tasks', { titulo: 'Excluir depois' });
      const taskId = JSON.parse(createdResponse.body).id;

      const response = await request(server, 'DELETE', `/tasks/${taskId}`);

      expect(response.statusCode).toBe(200);

      const listResponse = await request(server, 'GET', '/tasks');
      expect(JSON.parse(listResponse.body)).toEqual([]);
    } finally {
      server.close();
    }
  });
});
