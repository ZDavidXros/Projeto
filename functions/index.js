const functions = require("firebase-functions");
const {StreamChat} = require("stream-chat");


// Substitua pela sua chave de API e chave secreta do Stream Chat
const apiKey = "q4dak4xfkw8n";
const apiSecret = "9y4cb6swgrqgtn3abayjn9x89..." +
    "7zqd9tdxpgj67v2fs8vemuba2dq9x3styrt";

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

exports.generateStreamChatToken = functions.https.onRequest((req, res) => {
  const {userId} = req.query;

  if (!userId) {
    return res.status(400).json({error: "O parâmetro userId é obrigatório"});
  }

  try {
    const token = serverClient.createToken(userId);
    return res.status(200).json({token});
  } catch (error) {
    console.error("Erro ao gerar token:", error);
    return res.status(500).json({error: "Erro ao gerar token"});
  }
}); // Garante uma nova linha no final
