const test = require('node:test');
const assert = require('node:assert/strict');
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

test('lista tarefas vazias inicialmente', async () => {
  const server = await startServer();
  try {
    const response = await request(server, 'GET', '/tasks');

    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), []);
  } finally {
    server.close();
  }
});

test('cria uma tarefa e a lista', async () => {
  const server = await startServer();
  try {
    const createResponse = await request(server, 'POST', '/tasks', { titulo: 'Estudar DevOps' });

    assert.equal(createResponse.statusCode, 201);
    const createdTask = JSON.parse(createResponse.body);
    assert.equal(createdTask.titulo, 'Estudar DevOps');
    assert.equal(createdTask.concluida, false);

    const listResponse = await request(server, 'GET', '/tasks');
    const tasks = JSON.parse(listResponse.body);
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].id, createdTask.id);
  } finally {
    server.close();
  }
});

test('marca uma tarefa como concluída', async () => {
  const server = await startServer();
  try {
    const created = await request(server, 'POST', '/tasks', { titulo: 'Enviar trabalho' });
    const taskId = JSON.parse(created.body).id;

    const response = await request(server, 'PATCH', `/tasks/${taskId}/complete`);

    assert.equal(response.statusCode, 200);
    assert.equal(JSON.parse(response.body).concluida, true);
  } finally {
    server.close();
  }
});

test('remove uma tarefa', async () => {
  const server = await startServer();
  try {
    const created = await request(server, 'POST', '/tasks', { titulo: 'Excluir depois' });
    const taskId = JSON.parse(created.body).id;

    const response = await request(server, 'DELETE', `/tasks/${taskId}`);

    assert.equal(response.statusCode, 200);
    const listResponse = await request(server, 'GET', '/tasks');
    assert.deepEqual(JSON.parse(listResponse.body), []);
  } finally {
    server.close();
  }
});
