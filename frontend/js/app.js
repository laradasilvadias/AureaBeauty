

const API_BASE = '/api';

/* ---------------- Requisições à API*/
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('aurea_token');
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  let data = null;
  try { data = await resp.json(); } catch (e) { /* resposta sem corpo */ }

  if (!resp.ok) {
    throw new Error((data && data.erro) || 'Ocorreu um erro. Tente novamente.');
  }
  return data;
}

/* ---------------- Formatação */
function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_LABEL = {
  aguardando_pagamento: 'Aguardando pagamento',
  pagamento_aprovado: 'Pagamento aprovado',
  em_preparacao: 'Em preparação',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado'
};

/* ---------------- Sessão do cliente  */
function getUsuarioLogado() {
  const dados = localStorage.getItem('aurea_usuario');
  return dados ? JSON.parse(dados) : null;
}

function salvarSessao(token, usuario) {
  localStorage.setItem('aurea_token', token);
  localStorage.setItem('aurea_usuario', JSON.stringify(usuario));
}

function encerrarSessao() {
  localStorage.removeItem('aurea_token');
  localStorage.removeItem('aurea_usuario');
  window.location.href = '/index.html';
}

/* ---------------- Toasts (feedback visual) */
function mostrarToast(mensagem, tipo = 'sucesso') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  const icone = tipo === 'sucesso' ? 'fa-circle-check' : 'fa-circle-exclamation';
  toast.innerHTML = `<i class="fa-solid ${icone}"></i><span>${mensagem}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ---------------- Carrinho (armazenado no localStorage) */
const Carrinho = {
  obter() {
    const dados = localStorage.getItem('aurea_carrinho');
    return dados ? JSON.parse(dados) : [];
  },

  salvar(itens) {
    localStorage.setItem('aurea_carrinho', JSON.stringify(itens));
    atualizarBadgeCarrinho();
  },

  adicionar(produto, quantidade = 1) {
    const itens = this.obter();
    const existente = itens.find(i => i.produtoId === produto.id);
    if (existente) {
      existente.quantidade += quantidade;
    } else {
      itens.push({
        produtoId: produto.id,
        nome: produto.nome,
        marca: produto.marca,
        imagem: produto.imagem,
        preco: produto.preco_promocional || produto.preco,
        quantidade
      });
    }
    this.salvar(itens);
  },

  remover(produtoId) {
    const itens = this.obter().filter(i => i.produtoId !== produtoId);
    this.salvar(itens);
  },

  atualizarQuantidade(produtoId, quantidade) {
    const itens = this.obter();
    const item = itens.find(i => i.produtoId === produtoId);
    if (item) item.quantidade = Math.max(1, quantidade);
    this.salvar(itens);
  },

  totalItens() {
    return this.obter().reduce((soma, i) => soma + i.quantidade, 0);
  },

  totalValor() {
    return this.obter().reduce((soma, i) => soma + (i.preco * i.quantidade), 0);
  },

  limpar() {
    this.salvar([]);
  }
};

function atualizarBadgeCarrinho() {
  const badge = document.querySelector('.badge-carrinho');
  if (badge) badge.textContent = Carrinho.totalItens();
}

/* ---------------- Header dinâmico (login/cadastro vs conta) */
function montarAreaConta() {
  const area = document.querySelector('.conta-area');
  if (!area) return;
  const usuario = getUsuarioLogado();

  if (usuario) {
    area.innerHTML = `
      <button class="conta-botao" id="btnContaToggle">
        <i class="fa-regular fa-user"></i> ${usuario.nome.split(' ')[0]}
      </button>
      <div class="conta-dropdown" id="contaDropdown">
        <a href="/minha-conta.html"><i class="fa-regular fa-id-card"></i> Minha conta</a>
        <a href="/minha-conta.html#pedidos"><i class="fa-solid fa-box"></i> Meus pedidos</a>
        <button id="btnSair"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
      </div>
    `;
    document.getElementById('btnContaToggle').addEventListener('click', () => {
      document.getElementById('contaDropdown').classList.toggle('aberto');
    });
    document.getElementById('btnSair').addEventListener('click', encerrarSessao);
  } else {
    area.innerHTML = `
      <button class="conta-botao" id="btnContaToggle">
        <i class="fa-regular fa-user"></i> Entrar
      </button>
      <div class="conta-dropdown" id="contaDropdown">
        <a href="/login.html"><i class="fa-solid fa-right-to-bracket"></i> Entrar</a>
        <a href="/cadastro.html"><i class="fa-solid fa-user-plus"></i> Criar conta</a>
      </div>
    `;
    document.getElementById('btnContaToggle').addEventListener('click', () => {
      document.getElementById('contaDropdown').classList.toggle('aberto');
    });
  }

  document.addEventListener('click', (e) => {
    if (!area.contains(e.target)) {
      const dd = document.getElementById('contaDropdown');
      if (dd) dd.classList.remove('aberto');
    }
  });
}

/* ---------------- Menu mobile  */
function iniciarMenuMobile() {
  const btn = document.querySelector('.menu-mobile-btn');
  const overlay = document.querySelector('.overlay-mobile');
  const painel = document.querySelector('.menu-mobile-painel');
  const fechar = document.querySelector('.fechar-menu-mobile');
  if (!btn || !overlay || !painel) return;

  const abrir = () => { overlay.style.display = 'block'; painel.classList.add('aberto'); };
  const fecharMenu = () => { overlay.style.display = 'none'; painel.classList.remove('aberto'); };

  btn.addEventListener('click', abrir);
  overlay.addEventListener('click', fecharMenu);
  if (fechar) fechar.addEventListener('click', fecharMenu);
}

/* --------- Busca no header */
function iniciarBuscaHeader() {
  const form = document.querySelector('.busca-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const termo = form.querySelector('input').value.trim();
    if (termo) window.location.href = `/produtos.html?busca=${encodeURIComponent(termo)}`;
  });
}

function marcarMenuAtivo() {
  const caminho = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.menu-principal a, .menu-mobile-painel nav a').forEach(link => {
    const href = link.getAttribute('href').replace('/', '');
    if (href === caminho) link.classList.add('ativo');
  });
}


document.addEventListener('DOMContentLoaded', () => {
  montarAreaConta();
  atualizarBadgeCarrinho();
  iniciarMenuMobile();
  iniciarBuscaHeader();
  marcarMenuAtivo();

  const anoEl = document.getElementById('ano-atual');
  if (anoEl) anoEl.textContent = new Date().getFullYear();
});
