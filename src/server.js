const { createApp } = require('./routes');

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});