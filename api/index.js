const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

// Armazenamento em memória (substitui banco de dados)
const users = new Map();
const codigosVerificacao = {};

app.get("/api/check-email/:email", (req, res) => {
  const { email } = req.params;
  const exists = Array.from(users.values()).some(u => u.email === email);
  res.json({ exists });
});

app.post("/api/register", async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    // Verifica se o email já existe
    if (Array.from(users.values()).some(u => u.email === email)) {
      return res.status(400).json({ error: "Erro ao cadastrar. O e-mail pode já existir." });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = {
      id: Date.now().toString(),
      nome,
      email,
      senha: senhaHash,
      tipo: "cliente",
    };

    users.set(novoUsuario.id, novoUsuario);

    const { senha: _, ...userData } = novoUsuario;
    res.status(201).json({ success: true, user: userData });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Erro ao cadastrar. O e-mail pode já existir." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = Array.from(users.values()).find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ field: "email", message: "E-mail não cadastrado." });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ field: "password", message: "Senha incorreta." });
    }

    const { senha: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ field: "server", message: "Erro interno no servidor." });
  }
});

app.post("/api/send-code", (req, res) => {
  const { email } = req.body;
  const user = Array.from(users.values()).find(u => u.email === email);
  
  if (!user) {
    return res.status(404).json({ error: "E-mail não cadastrado." });
  }

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();

  codigosVerificacao[email] = {
    codigo: codigo,
    expira: Date.now() + 10 * 60 * 1000,
  };

  console.log(`Código para ${email}: ${codigo}`);
  res.json({ success: true });
});

app.post("/api/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  const dadosRecuperacao = codigosVerificacao[email];

  if (!dadosRecuperacao || dadosRecuperacao.codigo !== code) {
    return res.status(400).json({ error: "Código inválido." });
  }

  if (Date.now() > dadosRecuperacao.expira) {
    delete codigosVerificacao[email];
    return res.status(400).json({ error: "Este código expirou (limite de 10 min)." });
  }

  try {
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(newPassword, salt);

    user.senha = senhaHash;
    users.set(user.id, user);

    delete codigosVerificacao[email];

    res.json({ success: true, message: "Senha alterada com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar a senha." });
  }
});

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
