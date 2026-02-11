# 🚀 Sistema de Autenticação Full Stack

Um sistema de Login e Cadastro moderno, seguro e responsivo. Desenvolvido para demonstrar a integração de um Frontend dinâmico com um Backend robusto utilizando Node.js e Prisma ORM.



## ✨ Funcionalidades

- **Autenticação Segura:** Senhas criptografadas com Bcrypt.
- **Recuperação de Senha (OTP):** Fluxo em 3 etapas com código de verificação e expiração de 10 minutos.
- **Tema Dinâmico:** Alternância entre Dark e Light mode com persistência.
- **Validações Real-time:** Feedback imediato de erros no preenchimento.

---

## 🛠️ Como Ver o Projeto Funcionando (Passo a Passo)

Para testar todas as funcionalidades, siga este roteiro:

### 1. Cadastro
1. Clique em **"Cadastre-se"** na navegação.
2. Preencha nome, e-mail e senha (mín. 8 caracteres, maiúscula, número e símbolo).
3. O sistema valida se o e-mail já existe no banco antes de criar.

### 2. Login
1. Use as credenciais criadas.
2. O servidor compara o hash da senha enviada com a armazenada no **PostgreSQL**.

### 3. Recuperação de Senha (Esqueci minha senha)
1. Clique em **"Esqueci minha senha"** na tela de login.
2. **Etapa 1:** Digite o e-mail cadastrado. O código de 6 dígitos será gerado.
   > *Nota:* Como o sistema está em desenvolvimento, veja o código no terminal do seu VS Code.
3. **Etapa 2:** Insira o código. Ele expira em 10 minutos.
4. **Etapa 3:** Defina a nova senha. Ela será atualizada automaticamente no banco.

---

## 🚀 Tecnologias e Configuração

- **Linguagens:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Banco de Dados:** PostgreSQL + Prisma ORM
- **Segurança:** Bcrypt (Hashing)

### Como rodar localmente:

1. Clone o repositório.
2. Instale as dependências: `npm install`.
3. Configure o seu `.env` com a `DATABASE_URL`.
4. Gere o client do Prisma: `npx prisma generate`.
5. Inicie o servidor: `node server.js`.
6. Acesse: `http://localhost:3001`.

---
Desenvolvido por Gabriel Fagundes De Oliveira | https://www.linkedin.com/in/gabrielfagundesdeoliveira/