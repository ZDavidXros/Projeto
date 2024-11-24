const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');

// Configuração do Pusher
const pusher = new Pusher({
  appId: '1900509', // Substitua pelo seu app_id
  key: '4e772f4c4673ea59fcd6',  // Substitua pela sua chave
  secret: 'bc4059035df5d23be027', // Substitua pelo seu segredo
  cluster: 'us2', // Substitua pela sua região
  useTLS: true
});

// Criando o servidor Express
const app = express();
const port = 3000;

// Middleware para usar o body-parser
app.use(bodyParser.json());

// Endpoint para enviar eventos para o Pusher
app.post('/send-event', (req, res) => {
  const { matchId, message } = req.body;  // Recebe o matchId e a mensagem do corpo da requisição

  if (!matchId || !message) {
    return res.status(400).send({ error: 'matchId e message são obrigatórios.' });
  }

  // Enviar evento para o canal com o matchId
  pusher.trigger(matchId, 'client-message', {  // 'client-message' é o evento esperado no frontend
    text: message
  });

  res.send({ status: 'Event sent' });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
