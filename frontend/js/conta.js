/* ============================================================
   ÁUREA BEAUTY — conta.js
   Área do cliente: dados pessoais, endereço, senha, pedidos
   ============================================================ */

async function iniciarMinhaConta() {
  const container = document.getElementById('contaContainer');
  if (!container) return;

  exigirLogin();
  const usuario = getUsuarioLogado();
  if (!usuario) return;

  document.getElementById('contaNomeTopo').textContent = usuario.nome;

  await carregarDadosConta();
  await carregarPedidosConta();
  iniciarNavegacaoConta();
  iniciarFormularioDados();
  iniciarFormularioSenha();
  iniciarFormularioEndereco();

  if (window.location.hash === '#pedidos') {
    ativarPainel('pedidos');
  }
}

function iniciarNavegacaoConta() {
  document.querySelectorAll('.conta-menu button[data-painel]').forEach(btn => {
    btn.addEventListener('click', () => ativarPainel(btn.dataset.painel));
  });
  document.getElementById('btnSairConta')?.addEventListener('click', encerrarSessao);
}

function ativarPainel(nome) {
  document.querySelectorAll('.conta-painel').forEach(p => p.classList.remove('ativo'));
  document.querySelectorAll('.conta-menu button[data-painel]').forEach(b => b.classList.remove('ativo'));
  document.getElementById(`painel-${nome}`)?.classList.add('ativo');
  document.querySelector(`.conta-menu button[data-painel="${nome}"]`)?.classList.add('ativo');
}

async function carregarDadosConta() {
  try {
    const { usuario, enderecos } = await apiFetch('/users/profile');
    document.getElementById('inputNomeConta').value = usuario.nome;
    document.getElementById('inputEmailConta').value = usuario.email;
    document.getElementById('inputTelefoneConta').value = usuario.telefone || '';
    document.getElementById('inputCpfConta').value = usuario.cpf || '';

    const listaEnd = document.getElementById('listaEnderecosConta');
    if (listaEnd) {
      listaEnd.innerHTML = enderecos.length
        ? enderecos.map(e => `
            <div class="endereco-opcao">
              ${e.logradouro}, ${e.numero} ${e.complemento ? '- ' + e.complemento : ''}<br>
              ${e.bairro}, ${e.cidade}/${e.estado} — CEP ${e.cep}
            </div>`).join('')
        : '<p class="mensagem-vazia">Nenhum endereço cadastrado ainda.</p>';
    }
  } catch (err) {
    mostrarToast(err.message, 'erro');
  }
}

function iniciarFormularioDados() {
  const form = document.getElementById('formDadosConta');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const nome = document.getElementById('inputNomeConta').value.trim();
      const telefone = document.getElementById('inputTelefoneConta').value.trim();
      const cpf = document.getElementById('inputCpfConta').value.trim();
      const { usuario } = await apiFetch('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ nome, telefone, cpf })
      });
      const sessao = getUsuarioLogado();
      salvarSessao(localStorage.getItem('aurea_token'), { ...sessao, nome: usuario.nome });
      document.getElementById('contaNomeTopo').textContent = usuario.nome;
      mostrarToast('Dados atualizados com sucesso!', 'sucesso');
    } catch (err) {
      mostrarToast(err.message, 'erro');
    }
  });
}

function iniciarFormularioSenha() {
  const form = document.getElementById('formSenhaConta');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const senhaAtual = document.getElementById('inputSenhaAtual').value;
    const novaSenha = document.getElementById('inputNovaSenha').value;
    const confirmarNovaSenha = document.getElementById('inputConfirmarNovaSenha').value;

    if (novaSenha !== confirmarNovaSenha) {
      mostrarToast('As senhas não coincidem.', 'erro');
      return;
    }
    try {
      await apiFetch('/users/senha', {
        method: 'PUT',
        body: JSON.stringify({ senhaAtual, novaSenha })
      });
      mostrarToast('Senha alterada com sucesso!', 'sucesso');
      form.reset();
    } catch (err) {
      mostrarToast(err.message, 'erro');
    }
  });
}

function iniciarFormularioEndereco() {
  const form = document.getElementById('formEnderecoConta');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = {
      cep: document.getElementById('novoCep').value.trim(),
      logradouro: document.getElementById('novoLogradouro').value.trim(),
      numero: document.getElementById('novoNumero').value.trim(),
      complemento: document.getElementById('novoComplemento').value.trim(),
      bairro: document.getElementById('novoBairro').value.trim(),
      cidade: document.getElementById('novoCidade').value.trim(),
      estado: document.getElementById('novoEstado').value.trim()
    };
    try {
      await apiFetch('/users/endereco', { method: 'POST', body: JSON.stringify(dados) });
      mostrarToast('Endereço cadastrado com sucesso!', 'sucesso');
      form.reset();
      carregarDadosConta();
    } catch (err) {
      mostrarToast(err.message, 'erro');
    }
  });
}

async function carregarPedidosConta() {
  const container = document.getElementById('listaPedidosConta');
  if (!container) return;
  try {
    const pedidos = await apiFetch('/users/pedidos');
    container.innerHTML = pedidos.length
      ? pedidos.map(renderizarPedidoHistorico).join('')
      : '<p class="mensagem-vazia">Você ainda não fez nenhum pedido. <a href="/produtos.html">Ver perfumes</a></p>';
  } catch (err) {
    container.innerHTML = `<p class="mensagem-vazia">${err.message}</p>`;
  }
}

function renderizarPedidoHistorico(pedido) {
  return `
    <div class="pedido-historico-item">
      <div class="pedido-historico-cabecalho">
        <div>
          <strong>Pedido #${String(pedido.id).padStart(6, '0')}</strong>
          <div style="font-size:.8rem;color:var(--cinza-texto)">${formatarData(pedido.data_pedido)}</div>
        </div>
        <span class="status-badge status-${pedido.status}">${STATUS_LABEL[pedido.status]}</span>
      </div>
      <div class="pedido-historico-corpo">
        ${pedido.itens.map(item => `
          <div class="pedido-historico-produto">
            <img src="${item.imagem || 'https://placehold.co/100x120/f0e2c3/6b6459?text=AB'}" alt="${item.nome}">
            <span>${item.nome} × ${item.quantidade} — ${formatarPreco(item.subtotal)}</span>
          </div>
        `).join('')}
        <div class="resumo-linha total" style="margin-top:12px;">
          <span>Total</span><span>${formatarPreco(pedido.valor_total)}</span>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', iniciarMinhaConta);
