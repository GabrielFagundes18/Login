const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt")
require("dotenv").config();

// 1. Inicializa o App primeiro
const app = express();
const PORT = 3001;

// 2. Middlewares Básicos
app.use(cors());
app.use(express.json());

// 1. SERVIR ARQUIVOS: Tenta na raiz e na pasta public




// 4. Importações do Prisma (Deixamos aqui para não travar o início do app)
const { PrismaClient } = require("./generated/prisma");
const { withAccelerate } = require("@prisma/extension-accelerate");

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

// --- API: ROTAS DO SISTEMA ---

app.get("/api/check-email/:email", async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { email: req.params.email },
      select: { id: true } 
    });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ error: "Erro no banco" });
  }
});

app.post("/api/register", async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    // 1. Gera o "sal" e cria o hash da senha
    // O número 10 é o "custo" (equilíbrio entre segurança e velocidade)
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // 2. Salva no banco com a senha já codificada
    const novoUsuario = await prisma.usuario.create({
      data: { 
        nome, 
        email, 
        senha: senhaHash,
        tipo: "cliente" 
      },
    });

    res.status(201).json({ success: true, user: novoUsuario });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Erro ao cadastrar. O e-mail pode já existir." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ field: "email", message: "E-mail não cadastrado." });
    }

    // 3. COMPARAÇÃO SEGURA: 
    // O bcrypt pega a senha digitada, aplica o hash e compara com o do banco
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


const nodemailer = require("nodemailer");

// Armazenamento temporário de códigos (Em produção, use o banco de dados)
const codigosVerificacao = {};

app.post("/api/send-code", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "E-mail não cadastrado." });

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardamos o código e o tempo atual (milissegundos)
    codigosVerificacao[email] = {
      codigo: codigo,
      expira: Date.now() + (10 * 60 * 1000) // 10 minutos
    };

    console.log(`Código para ${email}: ${codigo}`); // Simulação de envio
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor." });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  // Recupera o objeto da memória
  const dadosRecuperacao = codigosVerificacao[email];

  // 1. Verifica se o registro existe e se o código bate
  // Agora comparamos dadosRecuperacao.codigo porque mudamos a estrutura no /send-code
  if (!dadosRecuperacao || dadosRecuperacao.codigo !== code) {
    return res.status(400).json({ error: "Código inválido." });
  }

  // 2. VERIFICAÇÃO DE EXPIRAÇÃO
  // Se o horário atual for maior que o horário de expiração salvo
  if (Date.now() > dadosRecuperacao.expira) {
    delete codigosVerificacao[email]; // Limpa para não ocupar memória
    return res.status(400).json({ error: "Este código expirou (limite de 10 min)." });
  }

  try {
    // 3. Criptografa a nova senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(newPassword, salt);

    // 4. Atualiza no banco usando Prisma
    await prisma.usuario.update({
      where: { email: email },
      data: { senha: senhaHash }
    });

    // 5. Remove o código usado da memória por segurança
    delete codigosVerificacao[email];

    res.json({ success: true, message: "Senha alterada com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar a senha no banco." });
  }
});


app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// 2. ROTA PRINCIPAL: Envia o index.html onde quer que ele esteja
app.get('/', (req, res) => {
  const rootPath = path.join(__dirname, 'index.html');
  const publicPath = path.join(__dirname, 'public', 'index.html');
  
  // Tenta enviar da raiz, se der erro, tenta da public
  res.sendFile(rootPath, (err) => {
    if (err) {
      res.sendFile(publicPath, (err2) => {
        if (err2) {
          res.status(404).send("<h1>Erro: Arquivo index.html não encontrado!</h1><p>Verifique se o nome do arquivo está correto.</p>");
        }
      });
    }
  });
});


// 5. LIGAR O SERVIDOR
app.listen(PORT, () => {
  console.log(`\n🚀 SITE ONLINE: http://localhost:${PORT}`);
  console.log(`📂 Pasta: ${__dirname}`);

  // Tenta conectar ao banco em segundo plano
  prisma
    .$connect()
    .then(() => console.log("🐘 Banco de Dados: OK"))
    .catch(() =>
      console.log("⚠️  Aviso: Banco offline, mas o site deve abrir."),
    );
});
