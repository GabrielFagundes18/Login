const slider = document.getElementById("form-slider");
const btnLoginNav = document.getElementById("nav-login");
const btnSignupNav = document.getElementById("nav-signup");

const brandingTitle = document.querySelector(".branding-content h1");
const paginationDots = document.querySelectorAll(".pagination span");

function setPagination(index) {
  paginationDots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

function goSignup() {
  slider.style.transform = "translateX(-50%)";

  btnSignupNav.classList.add("signup-pill");
  btnLoginNav.classList.remove("signup-pill");

  if (brandingTitle) {
    brandingTitle.innerText = "Crie sua conta agora";
  }
  setPagination(1);
}

function goLogin() {
  slider.style.transform = "translateX(0)";

  btnLoginNav.classList.add("signup-pill");
  btnSignupNav.classList.remove("signup-pill");

  if (brandingTitle) {
    brandingTitle.innerText = "Faca seu login";
  }
  setPagination(0);
}

btnSignupNav.onclick = goSignup;
btnLoginNav.onclick = goLogin;

document.querySelectorAll(".btn-switch-signup").forEach((btn) => {
  btn.onclick = goSignup;
});

document.querySelectorAll(".btn-switch-login").forEach((btn) => {
  btn.onclick = goLogin;
});

goLogin();

const API_URL = "/api";

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
    emailErrorRegister.innerHTML = "Os e-mails nao coincidem.";
    return false;
  }
  if (!regex.test(email)) {
    emailErrorRegister.innerHTML = "E-mail invalido.";
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/check-email/${email}`);
    const data = await response.json();
    if (data.exists) {
      emailErrorRegister.innerHTML = "E-mail ja cadastrado!";
      return false;
    }
  } catch (e) {
    emailErrorRegister.innerHTML = "Servidor offline.";
    return false;
  }
  return true;
}

async function registerUser(nome, email, senha) {
  const success = document.getElementById("success");
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    if (response.ok) {
      success.style.color = "var(--success)";
      success.innerHTML = "Cadastro realizado com sucesso!";
      setTimeout(() => {
        success.innerHTML = "Redirecionando...";
        setTimeout(goLogin, 1000);
      }, 1500);
    } else {
      const errorData = await response.json();
      success.style.color = "var(--error)";
      success.innerHTML = errorData.error || "Erro ao cadastrar.";
    }
  } catch (error) {
    success.style.color = "var(--error)";
    success.innerHTML = "Erro ao conectar ao servidor.";
  }
}

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
        data.tipo === "ADMIN"
          ? "/dashboard-admin.html"
          : "https://gabrielfagundes18.github.io/";
    } else {
      passwordError.innerHTML = "E-mail ou senha incorretos.";
    }
  } catch (err) {
    passwordError.innerHTML = "Servidor offline.";
  }
}

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

function toCheckPassword() {
  const passwordError = document.getElementById("passwordErrorRegister");
  const pass = document.getElementById("passwordRegister").value;
  const confirm = document.getElementById("passwordRegisterConfirm").value;

  const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
  const hasCapital = /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);

  if (pass === "" || confirm === "") {
    passwordError.innerHTML = "Preencha as senhas.";
    return false;
  }
  if (pass !== confirm) {
    passwordError.innerHTML = "Senhas nao conferem.";
    return false;
  }
  if (pass.length < 8 || !hasSpecial || !hasCapital || !hasNumber) {
    passwordError.innerHTML =
      "Senha fraca (Min. 8 caracteres, Maiuscula, Numero e Simbolo).";
    return false;
  }
  return true;
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

document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", (e) => {
    const errorId = e.target.getAttribute("data-error-id");
    if (errorId) {
      const errorElement = document.getElementById(errorId);
      if (errorElement) errorElement.innerHTML = "";
    }
  });
});

// Theme toggle
const themeToggle = document.getElementById("toggleTheme");
const rootHtml = document.documentElement;
const temaSalvo = localStorage.getItem("theme") || "dark";
rootHtml.setAttribute("data-theme", temaSalvo);

if (temaSalvo === "light" && themeToggle) {
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

// Password Recovery
const recoveryScreen = document.querySelector(".passwordRecovery");
const step1 = document.getElementById("step-1");
const step2 = document.getElementById("step-2");
const step3 = document.getElementById("step-3");
const btnForgot = document.getElementById("forgotPassword");
const btnBack = document.getElementById("btnBackToLogin");
const recoveryInstruction = document.getElementById("recoveryInstruction");

if (btnForgot) {
  btnForgot.onclick = (e) => {
    e.preventDefault();
    recoveryScreen.classList.add("active");
    mostrarEtapa(1);
  };
}

if (btnBack) {
  btnBack.onclick = () => {
    recoveryScreen.classList.remove("active");
  };
}

function mostrarEtapa(etapa) {
  step1.style.display = etapa === 1 ? "block" : "none";
  step2.style.display = etapa === 2 ? "block" : "none";
  step3.style.display = etapa === 3 ? "block" : "none";

  if (etapa === 1) {
    recoveryInstruction.innerHTML =
      "Informe seu e-mail para receber um codigo de validacao.";
  }
  if (etapa === 2) {
    recoveryInstruction.innerHTML =
      "Digite o codigo de 6 digitos enviado ao seu e-mail.";
  }
  if (etapa === 3) {
    recoveryInstruction.innerHTML =
      "Crie uma nova senha segura para sua conta.";
  }
}

document.getElementById("btnVerifyEmail").onclick = async () => {
  const btn = document.getElementById("btnVerifyEmail");
  const email = document.getElementById("emailRecovery").value.trim();
  const msg = document.getElementById("recoveryMsg");

  if (!email) {
    msg.innerHTML = "Digite seu e-mail.";
    return;
  }

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
      alert("Codigo enviado com sucesso!");
      mostrarEtapa(2);
    } else {
      msg.innerHTML = data.error || "E-mail nao encontrado.";
    }
  } catch (err) {
    msg.innerHTML = "Erro ao conectar com o servidor.";
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Enviar Codigo";
  }
};

document.getElementById("btnGoToStep3").onclick = () => {
  const code = document.getElementById("verificationCode").value.trim();
  const msgCode = document.getElementById("recoveryMsgCode");

  if (code.length === 6) {
    mostrarEtapa(3);
  } else {
    msgCode.innerHTML = "O codigo deve ter 6 digitos.";
  }
};

document.getElementById("btnUpdatePassword").onclick = async () => {
  const btn = document.getElementById("btnUpdatePassword");
  const email = document.getElementById("emailRecovery").value.trim();
  const code = document.getElementById("verificationCode").value.trim();
  const newPassword = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPasswordNew").value;
  const msg2 = document.getElementById("recoveryMsg2");

  if (newPassword !== confirm) {
    msg2.innerHTML = "As senhas nao coincidem.";
    return;
  }

  btn.disabled = true;
  btn.innerHTML = "Processando...";
  msg2.innerHTML = "";

  try {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Senha alterada com sucesso!");
      location.reload();
    } else {
      msg2.innerHTML = data.error || "Erro ao redefinir.";
    }
  } catch (err) {
    msg2.innerHTML = "Erro de conexao com o servidor.";
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Redefinir Senha";
  }
};
