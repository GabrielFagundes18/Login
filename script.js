// ===== ELEMENTOS =====
const slider = document.getElementById("form-slider");
const btnLoginNav = document.getElementById("nav-login");
const btnSignupNav = document.getElementById("nav-signup");

const brandingTitle = document.querySelector(".branding-content h1");
const paginationDots = document.querySelectorAll(".pagination span");

// ===== FUNÇÕES AUXILIARES =====
function setPagination(index) {
  paginationDots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

// ===== FUNÇÕES PRINCIPAIS =====
function goSignup() {
  slider.style.transform = "translateX(-50%)";

  // Navbar
  btnSignupNav.classList.add("signup-pill");
  btnLoginNav.classList.remove("signup-pill");

  // Branding side
  brandingTitle.innerText = "Crie sua conta agora 🚀";
  setPagination(1);
}

function goLogin() {
  slider.style.transform = "translateX(0)";

  // Navbar
  btnLoginNav.classList.add("signup-pill");
  btnSignupNav.classList.remove("signup-pill");

  // Branding side
  brandingTitle.innerText = "Faça seu login";
  setPagination(0);
}

// ===== EVENTOS NAVBAR =====
btnSignupNav.onclick = goSignup;
btnLoginNav.onclick = goLogin;

// ===== EVENTOS BOTÕES INTERNOS =====
document.querySelectorAll(".btn-switch-signup").forEach((btn) => {
  btn.onclick = goSignup;
});

document.querySelectorAll(".btn-switch-login").forEach((btn) => {
  btn.onclick = goLogin;
});

// ===== ESTADO INICIAL =====
goLogin();

// --- FUNÇÕES DE TROCA DE TELA ---
const body = document.body;
// --- INTEGRAÇÃO COM BANCO DE DADOS ---
const API_URL = "http://localhost:3001/api";

// 1. Validar e-mail no Banco
async function toCheckEmail() {
  const emailErrorRegister = document.getElementById("emailErrorRegister");
  const email = document.getElementById("emailRegister").value;
  const confirm = document.getElementById("emailRegisterConfirm").value;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailErrorRegister) return true;
  emailErrorRegister.innerHTML = "";

  if (email === "" || confirm === "") {
    emailErrorRegister.innerHTML = "Preencha os e-mails.";
    return false;
  }
  if (email !== confirm) {
    emailErrorRegister.innerHTML = "Os e-mails não coincidem.";
    return false;
  }
  if (!regex.test(email)) {
    emailErrorRegister.innerHTML = "E-mail inválido.";
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/check-email/${email}`);
    const data = await response.json();
    if (data.exists) {
      emailErrorRegister.innerHTML = "E-mail já cadastrado!";
      return false;
    }
  } catch (e) {
    emailErrorRegister.innerHTML = "Servidor offline.";
    return false;
  }
  return true;
}

// 2. Registrar Usuário no Postgres
async function registerUser(nome, email, senha) {
  const success = document.getElementById("success");
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }), // Senha limpa
    });

    if (response.ok) {
      success.style.color = "#00ff00";
      success.innerHTML = "🎉 Cadastro realizado!";
      setTimeout(() => {
        success.innerHTML = "Redirecionando...";
        setTimeout(goLogin, 1000);
      }, 1500);
    } else {
      const errorData = await response.json();
      success.innerHTML = errorData.error || "Erro ao cadastrar.";
    }
  } catch (error) {
    success.innerHTML = "Erro ao conectar ao servidor.";
  }
}

// 3. Login
async function acessarLogin() {
  const email = document.getElementById("emailLogin").value.trim();
  const senha = document.getElementById("passwordLogin").value;
  const passwordError = document.getElementById("passwordError");

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("usuarioLogado", JSON.stringify(data));
      alert("Login realizado com sucesso!");
      window.location.href =
        data.tipo === "ADMIN" ? "dashboard-admin.html" : "home.html";
    } else {
      passwordError.innerHTML = "E-mail ou senha incorretos.";
    }
  } catch (err) {
    passwordError.innerHTML = "Servidor offline.";
  }
}

// --- EVENTOS DE CLIQUE ---
document.getElementById("register").addEventListener("click", async (e) => {
  e.preventDefault();
  const isEmailOk = await toCheckEmail();
  const isPassOk = toCheckPassword();
  const isUserOk = toCheckUser();

  if (isEmailOk && isPassOk && isUserOk) {
    const nome = document.getElementById("userRegister").value;
    const email = document.getElementById("emailRegister").value;
    const senha = document.getElementById("passwordRegister").value;
    registerUser(nome, email, senha);
  }
});

document.getElementById("login").addEventListener("click", (e) => {
  e.preventDefault();
  acessarLogin();
});

// --- VALIDAÇÕES AUXILIARES ---
function toCheckPassword() {
  const passwordError = document.getElementById("passwordErrorRegister");
  const pass = document.getElementById("passwordRegister").value;
  const confirm = document.getElementById("passwordRegisterConfirm").value;

  const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
  const hasCapital = /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);

  if (pass === "" || confirm === "") {
    passwordError.innerHTML = "Preencha as senhas.";
  } else if (pass !== confirm) {
    passwordError.innerHTML = "Senhas não conferem.";
  } else if (pass.length < 8 || !hasSpecial || !hasCapital || !hasNumber) {
    passwordError.innerHTML =
      "Senha fraca (Mín. 8 caracteres, Maiúscula, Número e Símbolo).";
  } else {
    return true;
  }
  return false;
}

function toCheckUser() {
  const name = document.getElementById("userRegister").value;
  const nameError = document.getElementById("nameError");
  const namePart = name.split(" ").filter((p) => p.length > 0);

  if (name === "" || namePart.length < 2) {
    nameError.innerHTML = "Digite nome e sobrenome.";
    return false;
  }
  return true;
}

// Limpar erros ao digitar
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", (e) => {
    const errorId = e.target.getAttribute("data-error-id");
    if (errorId) {
      const errorElement = document.getElementById(errorId);
      if (errorElement) errorElement.innerHTML = "";
    }
  });
});

const themeToggle = document.getElementById("toggleTheme");
const rootHtml = document.documentElement;
const temaSalvo = localStorage.getItem("theme") || "light";
rootHtml.setAttribute("data-theme", temaSalvo);

// Ajuste aqui: troquei toggleTheme por themeToggle
if (temaSalvo === "dark" && themeToggle) {
    themeToggle.classList.remove("bi-sun");
    themeToggle.classList.add("bi-moon-stars");
}

function changeTheme() {
    const currentTheme = rootHtml.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    rootHtml.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    if (themeToggle) {
        themeToggle.classList.toggle("bi-sun");
        themeToggle.classList.toggle("bi-moon-stars");
    }
}

if (themeToggle) {
    themeToggle.addEventListener("click", changeTheme);
}

// Elementos de Recuperação
const recoveryScreen = document.querySelector(".passwordRecovery");
const step1 = document.getElementById("step-1");
const step2 = document.getElementById("step-2");
const step3 = document.getElementById("step-3");
const btnForgot = document.getElementById("forgotPassword");
const btnBack = document.getElementById("btnBackToLogin");
const recoveryInstruction = document.getElementById("recoveryInstruction");

// --- CONTROLE DE TELAS ---

// Abrir tela de recuperação
if (btnForgot) {
    btnForgot.onclick = (e) => {
        e.preventDefault();
        recoveryScreen.classList.add("active");
        mostrarEtapa(1);
    };
}

// Voltar para login
btnBack.onclick = () => {
    recoveryScreen.classList.remove("active");
};

// Função auxiliar para trocar de etapa visualmente
function mostrarEtapa(etapa) {
    step1.style.display = etapa === 1 ? "block" : "none";
    step2.style.display = etapa === 2 ? "block" : "none";
    step3.style.display = etapa === 3 ? "block" : "none";

    if (etapa === 1) recoveryInstruction.innerHTML = "Informe seu e-mail para receber um código de validação.";
    if (etapa === 2) recoveryInstruction.innerHTML = "Digite o código de 6 dígitos enviado ao seu e-mail.";
    if (etapa === 3) recoveryInstruction.innerHTML = "Crie uma nova senha segura para sua conta.";
}

// --- LÓGICA DAS ETAPAS ---

// ETAPA 1: Verificar E-mail e Enviar Código
document.getElementById("btnVerifyEmail").onclick = async () => {
    const btn = document.getElementById("btnVerifyEmail"); 
    const email = document.getElementById("emailRecovery").value.trim();
    const msg = document.getElementById("recoveryMsg");

    if (!email) {
        msg.innerHTML = "Digite seu e-mail.";
        return;
    }

    // Feedback visual
    btn.disabled = true; 
    btn.innerHTML = "Enviando..."; 

    try {
        const response = await fetch(`${API_URL}/send-code`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Código enviado com sucesso!");
            mostrarEtapa(2);
        } else {
            msg.innerHTML = data.error || "E-mail não encontrado.";
        }
    } catch (err) {
        msg.innerHTML = "Erro ao conectar com o servidor.";
    } finally {
        btn.disabled = false; 
        btn.innerHTML = "Enviar Código"; 
    }
};

// ETAPA 2: Validar Código e Ir para Senha
// (Criamos esse botão para separar o código da senha)
document.getElementById("btnGoToStep3").onclick = () => {
    const code = document.getElementById("verificationCode").value.trim();
    const msgCode = document.getElementById("recoveryMsgCode");

    if (code.length === 6) {
        mostrarEtapa(3);
    } else {
        msgCode.innerHTML = "O código deve ter 6 dígitos.";
    }
};

// ETAPA 3: Redefinir Senha Final
document.getElementById("btnUpdatePassword").onclick = async () => {
    const btn = document.getElementById("btnUpdatePassword");
    const email = document.getElementById("emailRecovery").value.trim();
    const code = document.getElementById("verificationCode").value.trim();
    const newPassword = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirmPasswordNew").value;
    const msg2 = document.getElementById("recoveryMsg2");

    // Validações básicas antes de enviar
    if (newPassword !== confirm) {
        msg2.innerHTML = "As senhas não coincidem.";
        return;
    }

    // --- INÍCIO DO FEEDBACK DE CARREGAMENTO ---
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Processando...';
    msg2.innerHTML = ""; // Limpa erros anteriores

    try {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, newPassword }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("🎉 Senha alterada com sucesso!");
            location.reload();
        } else {
            // Aqui ele mostrará "Código expirado" se o tempo acabar
            msg2.innerHTML = data.error || "Erro ao redefinir.";
        }
    } catch (err) {
        msg2.innerHTML = "Erro de conexão com o servidor.";
    } finally {
        // --- FINALIZA O CARREGAMENTO ---
        btn.disabled = false;
        btn.innerHTML = "Redefinir Senha";
    }
};
