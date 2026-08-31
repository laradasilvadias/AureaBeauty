/* ============================================================
   ÁUREA BEAUTY — auth.js
   Lógica das páginas de login e cadastro
   ============================================================ */

function exibirErroCampo(inputId, mensagem) {
  const campo = document.getElementById(inputId).closest('.campo');
  campo.classList.add('invalido');
  const erroEl = campo.querySelector('.campo-erro');
  if (erroEl) erroEl.textContent = mensagem;
}

function limparErrosCampos(form) {
  form.querySelectorAll('.campo').forEach(c => c.classList.remove('invalido'));
}

/* ---------------- Formulário de Login ---------------- */
function iniciarFormularioLogin() {
  const form = document.getElementById('formLogin');
  if (!form) return;

  // Se já estiver logado, redireciona
  if (getUsuarioLogado()) {
    window.location.href = '/minha-conta.html';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    limparErrosCampos(form);

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
      });
      salvarSessao(data.token, data.usuario);
      mostrarToast('Login realizado com sucesso!', 'sucesso');
      setTimeout(() => { window.location.href = '/minha-conta.html'; }, 700);
    } catch (err) {
      mostrarToast(err.message, 'erro');
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
}

/* ---------------- Formulário de Cadastro ---------------- */
function iniciarFormularioCadastro() {
  const form = document.getElementById('formCadastro');
  if (!form) return;

  if (getUsuarioLogado()) {
    window.location.href = '/minha-conta.html';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    limparErrosCampos(form);

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const telefone = document.getElementById('telefone').value.trim();
    const cpf = document.getElementById('cpf').value.trim();

    let valido = true;
    if (nome.length < 3) { exibirErroCampo('nome', 'Informe seu nome completo.'); valido = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { exibirErroCampo('email', 'E-mail inválido.'); valido = false; }
    if (senha.length < 6) { exibirErroCampo('senha', 'Mínimo de 6 caracteres.'); valido = false; }
    if (senha !== confirmarSenha) { exibirErroCampo('confirmarSenha', 'As senhas não coincidem.'); valido = false; }
    if (!valido) return;

    const endereco = {
      cep: document.getElementById('cep')?.value.trim(),
      logradouro: document.getElementById('logradouro')?.value.trim(),
      numero: document.getElementById('numero')?.value.trim(),
      complemento: document.getElementById('complemento')?.value.trim(),
      bairro: document.getElementById('bairro')?.value.trim(),
      cidade: document.getElementById('cidade')?.value.trim(),
      estado: document.getElementById('estado')?.value.trim()
    };

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Criando conta...';

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha, confirmarSenha, telefone, cpf, endereco })
      });
      salvarSessao(data.token, data.usuario);
      mostrarToast('Conta criada com sucesso! Bem-vinda(o) à Áurea Beauty.', 'sucesso');
      setTimeout(() => { window.location.href = '/minha-conta.html'; }, 800);
    } catch (err) {
      mostrarToast(err.message, 'erro');
      btn.disabled = false;
      btn.textContent = 'Criar conta';
    }
  });
}

/* ---------------- Proteção de rotas do cliente ---------------- */
function exigirLogin() {
  if (!getUsuarioLogado()) {
    window.location.href = '/login.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  iniciarFormularioLogin();
  iniciarFormularioCadastro();
});
