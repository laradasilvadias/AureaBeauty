

function getAdminLogado() {
  const usuario = getUsuarioLogado();
  return usuario && usuario.tipo === 'admin' ? usuario : null;
}

function exigirAdmin() {
  if (!getAdminLogado()) {
    window.location.href = '/admin/login.html';
  }
}

function montarInfoAdminTopo() {
  const el = document.getElementById('adminUsuarioNome');
  const admin = getAdminLogado();
  if (el && admin) el.textContent = admin.nome;
  const avatar = document.getElementById('adminAvatarInicial');
  if (avatar && admin) avatar.textContent = admin.nome.charAt(0).toUpperCase();
}

function iniciarLogoutAdmin() {
  document.getElementById('btnSairAdmin')?.addEventListener('click', encerrarSessao);
}

function iniciarMenuLateralMobile() {
  document.getElementById('btnAbrirSidebar')?.addEventListener('click', () => {
    document.querySelector('.admin-sidebar')?.classList.toggle('aberta');
  });
}

/* ---------------- Login administrativo */
function iniciarLoginAdmin() {
  const form = document.getElementById('formLoginAdmin');
  if (!form) return;

  if (getAdminLogado()) {
    window.location.href = '/admin/dashboard.html';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const senha = document.getElementById('adminSenha').value;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try {
      const data = await apiFetch('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
      });
      salvarSessao(data.token, data.usuario);
      window.location.href = '/admin/dashboard.html';
    } catch (err) {
      mostrarToast(err.message, 'erro');
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
}

/* ---------------- Dashboard */
async function iniciarDashboardAdmin() {
  const container = document.getElementById('dashboardContainer');
  if (!container) return;
  exigirAdmin();

  try {
    const dados = await apiFetch('/admin/dashboard');

    document.getElementById('statTotalProdutos').textContent = dados.totalProdutos;
    document.getElementById('statTotalClientes').textContent = dados.totalClientes;
    document.getElementById('statTotalPedidos').textContent = dados.totalPedidos;
    document.getElementById('statValorVendas').textContent = formatarPreco(dados.valorVendas);

    const estoqueBaixoEl = document.getElementById('listaEstoqueBaixo');
    estoqueBaixoEl.innerHTML = dados.estoqueBaixo.length
      ? dados.estoqueBaixo.map(p => `
          <div class="tabela-produto-nome" style="margin-bottom:14px;">
            <img src="${p.imagem || 'https://placehold.co/60x70/f0e2c3/6b6459?text=AB'}" alt="${p.nome}">
            <div>
              <div>${p.nome}</div>
              <span class="badge-estoque-baixo">${p.estoque} un. restantes</span>
            </div>
          </div>`).join('')
      : '<p class="mensagem-vazia">Nenhum produto com estoque baixo.</p>';

    const pedidosRecentesEl = document.getElementById('listaPedidosRecentes');
    pedidosRecentesEl.innerHTML = dados.pedidosRecentes.length
      ? `<div class="tabela-wrapper"><table class="admin-tabela">
          <thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>${dados.pedidosRecentes.map(p => `
            <tr>
              <td>#${String(p.id).padStart(6, '0')}</td>
              <td>${p.cliente_nome}</td>
              <td>${formatarData(p.data_pedido)}</td>
              <td>${formatarPreco(p.valor_total)}</td>
              <td><span class="status-badge status-${p.status}">${STATUS_LABEL[p.status]}</span></td>
            </tr>`).join('')}</tbody>
        </table></div>`
      : '<p class="mensagem-vazia">Nenhum pedido registrado ainda.</p>';
  } catch (err) {
    mostrarToast(err.message, 'erro');
  }
}

/* ---------------- Gerenciamento de produtos */
let produtosAdminCache = [];
let categoriasCache = [];

async function iniciarProdutosAdmin() {
  const container = document.getElementById('produtosAdminContainer');
  if (!container) return;
  exigirAdmin();

  categoriasCache = await apiFetch('/products/categorias').catch(() => []);
  montarSelectCategorias();
  await carregarTabelaProdutos();

  document.getElementById('btnNovoProduto').addEventListener('click', () => abrirModalProduto());
  document.getElementById('btnFecharModalProduto').addEventListener('click', fecharModalProduto);
  document.getElementById('formProduto').addEventListener('submit', salvarProduto);
  document.getElementById('inputImagemProduto').addEventListener('change', previewImagemProduto);
}

function montarSelectCategorias() {
  const select = document.getElementById('selectCategoriaProduto');
  if (!select) return;
  select.innerHTML = '<option value="">Selecione uma categoria</option>' +
    categoriasCache.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
}

async function carregarTabelaProdutos() {
  const tbody = document.getElementById('tabelaProdutosBody');
  tbody.innerHTML = `<tr><td colspan="7"><div class="loader"><div class="anel"></div></div></td></tr>`;
  try {
    produtosAdminCache = await apiFetch('/products/admin/todos');
    tbody.innerHTML = produtosAdminCache.map(p => `
      <tr>
        <td>
          <div class="tabela-produto-nome">
            <img src="${p.imagem || 'https://placehold.co/60x70/f0e2c3/6b6459?text=AB'}" alt="${p.nome}">
            <div>${p.nome}<br><small style="color:var(--cinza-texto)">${p.marca}</small></div>
          </div>
        </td>
        <td>${p.categoria_nome || '—'}</td>
        <td>${formatarPreco(p.preco_promocional || p.preco)}</td>
        <td>${p.estoque <= 5 ? `<span class="badge-estoque-baixo">${p.estoque}</span>` : p.estoque}</td>
        <td>${p.destaque ? '<i class="fa-solid fa-star" style="color:var(--ouro)"></i>' : '—'}</td>
        <td>${p.ativo ? 'Ativo' : 'Inativo'}</td>
        <td>
          <div class="acoes-tabela">
            <button title="Editar" onclick="abrirModalProduto(${p.id})"><i class="fa-solid fa-pen"></i></button>
            <button title="Excluir" class="excluir" onclick="excluirProduto(${p.id})"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7">${err.message}</td></tr>`;
  }
}

function abrirModalProduto(id = null) {
  const form = document.getElementById('formProduto');
  form.reset();
  document.getElementById('previewImagemProduto').style.display = 'none';
  document.getElementById('produtoIdEdicao').value = '';

  if (id) {
    const produto = produtosAdminCache.find(p => p.id === id);
    document.getElementById('modalProdutoTitulo').textContent = 'Editar perfume';
    document.getElementById('produtoIdEdicao').value = id;
    document.getElementById('inputNomeProduto').value = produto.nome;
    document.getElementById('inputMarcaProduto').value = produto.marca;
    document.getElementById('selectCategoriaProduto').value = produto.categoria_id || '';
    document.getElementById('selectGeneroProduto').value = produto.genero;
    document.getElementById('inputDescricaoProduto').value = produto.descricao || '';
    document.getElementById('inputVolumeProduto').value = produto.volume_ml;
    document.getElementById('inputPrecoProduto').value = produto.preco;
    document.getElementById('inputPrecoPromoProduto').value = produto.preco_promocional || '';
    document.getElementById('inputEstoqueProduto').value = produto.estoque;
    document.getElementById('checkDestaqueProduto').checked = !!produto.destaque;
    document.getElementById('checkLancamentoProduto').checked = !!produto.lancamento;
    if (produto.imagem) {
      const preview = document.getElementById('previewImagemProduto');
      preview.src = produto.imagem;
      preview.style.display = 'block';
    }
  } else {
    document.getElementById('modalProdutoTitulo').textContent = 'Cadastrar novo perfume';
  }

  document.getElementById('modalProdutoOverlay').classList.add('aberto');
}

function fecharModalProduto() {
  document.getElementById('modalProdutoOverlay').classList.remove('aberto');
}

function previewImagemProduto(e) {
  const arquivo = e.target.files[0];
  if (!arquivo) return;
  const preview = document.getElementById('previewImagemProduto');
  preview.src = URL.createObjectURL(arquivo);
  preview.style.display = 'block';
}

async function salvarProduto(e) {
  e.preventDefault();
  const id = document.getElementById('produtoIdEdicao').value;
  const btn = document.getElementById('btnSalvarProduto');

  const formData = new FormData();
  formData.append('nome', document.getElementById('inputNomeProduto').value.trim());
  formData.append('marca', document.getElementById('inputMarcaProduto').value.trim());
  formData.append('categoria_id', document.getElementById('selectCategoriaProduto').value);
  formData.append('genero', document.getElementById('selectGeneroProduto').value);
  formData.append('descricao', document.getElementById('inputDescricaoProduto').value.trim());
  formData.append('volume_ml', document.getElementById('inputVolumeProduto').value);
  formData.append('preco', document.getElementById('inputPrecoProduto').value);
  formData.append('preco_promocional', document.getElementById('inputPrecoPromoProduto').value || '');
  formData.append('estoque', document.getElementById('inputEstoqueProduto').value);
  formData.append('destaque', document.getElementById('checkDestaqueProduto').checked);
  formData.append('lancamento', document.getElementById('checkLancamentoProduto').checked);

  const arquivo = document.getElementById('inputImagemProduto').files[0];
  if (arquivo) formData.append('imagem', arquivo);

  btn.disabled = true;
  btn.textContent = 'Salvando...';

  try {
    await apiFetch(id ? `/products/${id}` : '/products', {
      method: id ? 'PUT' : 'POST',
      body: formData
    });
    mostrarToast(`Perfume ${id ? 'atualizado' : 'cadastrado'} com sucesso!`, 'sucesso');
    fecharModalProduto();
    carregarTabelaProdutos();
  } catch (err) {
    mostrarToast(err.message, 'erro');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Salvar perfume';
  }
}

async function excluirProduto(id) {
  if (!confirm('Tem certeza que deseja excluir este perfume? Ele deixará de aparecer no catálogo.')) return;
  try {
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
    mostrarToast('Perfume excluído com sucesso!', 'sucesso');
    carregarTabelaProdutos();
  } catch (err) {
    mostrarToast(err.message, 'erro');
  }
}

/* ---------------- Gerenciamento de pedidos */
async function iniciarPedidosAdmin() {
  const tbody = document.getElementById('tabelaPedidosBody');
  if (!tbody) return;
  exigirAdmin();

  try {
    const pedidos = await apiFetch('/admin/orders');
    tbody.innerHTML = pedidos.map(p => `
      <tr>
        <td>#${String(p.id).padStart(6, '0')}</td>
        <td>${p.cliente_nome}<br><small style="color:var(--cinza-texto)">${p.cliente_email}</small></td>
        <td>${formatarData(p.data_pedido)}</td>
        <td>${p.itens.length} item(ns)</td>
        <td>${formatarPreco(p.valor_total)}</td>
        <td style="text-transform:capitalize">${p.forma_pagamento}</td>
        <td>
          <select class="status-select" onchange="atualizarStatusPedido(${p.id}, this.value)">
            ${Object.entries(STATUS_LABEL).map(([valor, rotulo]) =>
              `<option value="${valor}" ${p.status === valor ? 'selected' : ''}>${rotulo}</option>`
            ).join('')}
          </select>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="7">Nenhum pedido registrado ainda.</td></tr>`;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7">${err.message}</td></tr>`;
  }
}

async function atualizarStatusPedido(id, status) {
  try {
    await apiFetch(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    mostrarToast('Status do pedido atualizado!', 'sucesso');
  } catch (err) {
    mostrarToast(err.message, 'erro');
  }
}

/* ---------------- Gerenciamento de clientes */
async function iniciarUsuariosAdmin() {
  const tbody = document.getElementById('tabelaUsuariosBody');
  if (!tbody) return;
  exigirAdmin();

  try {
    const clientes = await apiFetch('/admin/users');
    tbody.innerHTML = clientes.map(c => `
      <tr>
        <td>${c.nome}</td>
        <td>${c.email}</td>
        <td>${c.telefone || '—'}</td>
        <td>${formatarData(c.criado_em)}</td>
        <td>${c.ativo ? '<span style="color:var(--sucesso)">Ativo</span>' : '<span style="color:var(--erro)">Inativo</span>'}</td>
      </tr>
    `).join('') || `<tr><td colspan="5">Nenhum cliente cadastrado ainda.</td></tr>`;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">${err.message}</td></tr>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  montarInfoAdminTopo();
  iniciarLogoutAdmin();
  iniciarMenuLateralMobile();
  iniciarLoginAdmin();
  iniciarDashboardAdmin();
  iniciarProdutosAdmin();
  iniciarPedidosAdmin();
  iniciarUsuariosAdmin();
});
