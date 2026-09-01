

/* ---------------- Página: carrinho.html */
function renderizarCarrinho() {
  const listaEl = document.getElementById('carrinhoLista');
  if (!listaEl) return;

  const itens = Carrinho.obter();

  if (!itens.length) {
    listaEl.innerHTML = `
      <div class="carrinho-vazio">
        <i class="fa-solid fa-bag-shopping"></i>
        <p>Seu carrinho está vazio.</p>
        <a href="/produtos.html" class="btn btn-primario">Continuar comprando</a>
      </div>`;
    document.getElementById('carrinhoResumo').style.display = 'none';
    return;
  }

  document.getElementById('carrinhoResumo').style.display = 'block';

  listaEl.innerHTML = itens.map(item => `
    <div class="carrinho-item" data-id="${item.produtoId}">
      <div class="carrinho-item-imagem">
        <img src="${item.imagem || 'https://placehold.co/200x240/f0e2c3/6b6459?text=Áurea'}" alt="${item.nome}">
      </div>
      <div>
        <div class="carrinho-item-marca">${item.marca}</div>
        <div class="carrinho-item-nome">${item.nome}</div>
        <div style="font-size:.82rem;color:var(--cinza-texto)">${formatarPreco(item.preco)} / unidade</div>
      </div>
      <div class="quantidade-seletor carrinho-item-qtd">
        <button class="btn-dim" data-acao="diminuir">−</button>
        <input type="number" value="${item.quantidade}" min="1" readonly>
        <button class="btn-dim" data-acao="aumentar">+</button>
      </div>
      <div class="carrinho-item-subtotal" style="font-family:var(--fonte-display);font-size:1.1rem;">
        ${formatarPreco(item.preco * item.quantidade)}
      </div>
      <button class="carrinho-item-remover" title="Remover"><i class="fa-solid fa-trash"></i></button>
    </div>
  `).join('');

  listaEl.querySelectorAll('.carrinho-item').forEach(el => {
    const id = Number(el.dataset.id);

    el.querySelector('[data-acao="aumentar"]').addEventListener('click', () => {
      const item = Carrinho.obter().find(i => i.produtoId === id);
      Carrinho.atualizarQuantidade(id, item.quantidade + 1);
      renderizarCarrinho();
    });
    el.querySelector('[data-acao="diminuir"]').addEventListener('click', () => {
      const item = Carrinho.obter().find(i => i.produtoId === id);
      if (item.quantidade <= 1) return;
      Carrinho.atualizarQuantidade(id, item.quantidade - 1);
      renderizarCarrinho();
    });
    el.querySelector('.carrinho-item-remover').addEventListener('click', () => {
      Carrinho.remover(id);
      renderizarCarrinho();
      mostrarToast('Produto removido do carrinho.', 'sucesso');
    });
  });

  atualizarResumoCarrinho();
}

function atualizarResumoCarrinho() {
  const totalItens = Carrinho.totalItens();
  const totalValor = Carrinho.totalValor();

  const elItens = document.getElementById('resumoItens');
  const elSubtotal = document.getElementById('resumoSubtotal');
  const elTotal = document.getElementById('resumoTotal');

  if (elItens) elItens.textContent = `${totalItens} ite${totalItens === 1 ? 'm' : 'ns'}`;
  if (elSubtotal) elSubtotal.textContent = formatarPreco(totalValor);
  if (elTotal) elTotal.textContent = formatarPreco(totalValor);
}

/* ---------------- Página: checkout.html ---------------- */
async function iniciarCheckout() {
  const container = document.getElementById('checkoutContainer');
  if (!container) return;

  exigirLogin();
  const usuario = getUsuarioLogado();
  if (!usuario) return;

  const itens = Carrinho.obter();
  if (!itens.length) {
    window.location.href = '/carrinho.html';
    return;
  }

  await carregarEnderecosCheckout();
  renderizarResumoCheckout();
  iniciarSelecaoPagamento();

  document.getElementById('formCheckout').addEventListener('submit', finalizarPedido);
}

async function carregarEnderecosCheckout() {
  const container = document.getElementById('listaEnderecos');
  try {
    const { enderecos } = await apiFetch('/users/profile');
    if (enderecos.length) {
      container.innerHTML = enderecos.map((e, idx) => `
        <label class="endereco-opcao ${idx === 0 ? 'selecionada' : ''}">
          <input type="radio" name="enderecoId" value="${e.id}" ${idx === 0 ? 'checked' : ''} style="display:none">
          ${e.logradouro}, ${e.numero} — ${e.bairro}, ${e.cidade}/${e.estado} — CEP ${e.cep}
        </label>
      `).join('');

      container.querySelectorAll('.endereco-opcao').forEach(el => {
        el.addEventListener('click', () => {
          container.querySelectorAll('.endereco-opcao').forEach(o => o.classList.remove('selecionada'));
          el.classList.add('selecionada');
          el.querySelector('input').checked = true;
        });
      });
    } else {
      container.innerHTML = `<p class="mensagem-vazia">Nenhum endereço cadastrado. <a href="/minha-conta.html">Cadastre um endereço</a> antes de continuar.</p>`;
    }
  } catch (err) {
    container.innerHTML = `<p class="mensagem-vazia">${err.message}</p>`;
  }
}

function renderizarResumoCheckout() {
  const itens = Carrinho.obter();
  const container = document.getElementById('checkoutResumoItens');
  container.innerHTML = itens.map(item => `
    <div class="resumo-linha">
      <span>${item.nome} × ${item.quantidade}</span>
      <span>${formatarPreco(item.preco * item.quantidade)}</span>
    </div>
  `).join('');
  document.getElementById('checkoutTotal').textContent = formatarPreco(Carrinho.totalValor());
}

function iniciarSelecaoPagamento() {
  const opcoes = document.querySelectorAll('.pagamento-opcao');
  opcoes.forEach(op => {
    op.addEventListener('click', () => {
      opcoes.forEach(o => o.classList.remove('selecionada'));
      op.classList.add('selecionada');
      op.querySelector('input').checked = true;
    });
  });
}

async function finalizarPedido(e) {
  e.preventDefault();
  const btn = document.getElementById('btnFinalizarPedido');
  const enderecoId = document.querySelector('input[name="enderecoId"]:checked')?.value;
  const formaPagamento = document.querySelector('input[name="pagamento"]:checked')?.value;

  if (!enderecoId) { mostrarToast('Selecione um endereço de entrega.', 'erro'); return; }
  if (!formaPagamento) { mostrarToast('Selecione a forma de pagamento.', 'erro'); return; }

  const itens = Carrinho.obter().map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade }));

  btn.disabled = true;
  btn.textContent = 'Processando pedido...';

  try {
    const { pedido } = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({ itens, enderecoId, formaPagamento })
    });
    Carrinho.limpar();
    window.location.href = `/pedido-confirmado.html?id=${pedido.id}`;
  } catch (err) {
    mostrarToast(err.message, 'erro');
    btn.disabled = false;
    btn.textContent = 'Finalizar pedido';
  }
}

/* ---------------- Página: pedido-confirmado.html ---------------- */
async function iniciarPedidoConfirmado() {
  const el = document.getElementById('numeroPedidoConfirmado');
  if (!el) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  el.textContent = `Pedido #${String(id).padStart(6, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarCarrinho();
  iniciarCheckout();
  iniciarPedidoConfirmado();
});
