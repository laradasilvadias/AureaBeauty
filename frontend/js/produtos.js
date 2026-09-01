

/* ---------------- Template de card de produto ---------------- */
function criarCardProduto(produto) {
  const temPromo = produto.preco_promocional && Number(produto.preco_promocional) < Number(produto.preco);
  const precoFinal = temPromo ? produto.preco_promocional : produto.preco;
  const imagem = produto.imagem || '/assets/imagens/placeholder.jpg';

  return `
    <div class="produto-card" data-id="${produto.id}">
      <a href="/produto.html?id=${produto.id}" class="produto-imagem">
        <div class="produto-tags">
          ${produto.lancamento ? '<span class="tag lancamento">Lançamento</span>' : ''}
          ${temPromo ? '<span class="tag promo">Oferta</span>' : ''}
        </div>
        <img src="${imagem}" alt="${produto.nome}" loading="lazy"
             onerror="this.src='https://placehold.co/400x520/f0e2c3/6b6459?text=Áurea+Beauty'">
      </a>
      <div class="produto-acoes-flutuantes">
        <button class="acao-flutuante btn-add-rapido" title="Adicionar ao carrinho" data-id="${produto.id}">
          <i class="fa-solid fa-bag-shopping"></i>
        </button>
        <a href="/produto.html?id=${produto.id}" class="acao-flutuante" title="Ver detalhes">
          <i class="fa-regular fa-eye"></i>
        </a>
      </div>
      <div class="produto-info">
        <div class="produto-marca">${produto.marca}</div>
        <h3 class="produto-nome"><a href="/produto.html?id=${produto.id}">${produto.nome}</a></h3>
        <div class="produto-volume">${produto.volume_ml}ml</div>
        <div class="produto-preco-linha">
          ${temPromo ? `<span class="preco-antigo">${formatarPreco(produto.preco)}</span>` : ''}
          <span class="preco-atual">${formatarPreco(precoFinal)}</span>
        </div>
        ${produto.estoque > 0 && produto.estoque <= 5 ? `<div class="produto-estoque-baixo">Últimas ${produto.estoque} unidades</div>` : ''}
        <button class="btn btn-primario btn-full btn-full-add" data-id="${produto.id}" ${produto.estoque === 0 ? 'disabled' : ''}>
          ${produto.estoque === 0 ? 'Esgotado' : '<i class="fa-solid fa-bag-shopping"></i> Adicionar'}
        </button>
      </div>
    </div>
  `;
}

function ativarBotoesAdicionar(container, listaProdutos) {
  container.querySelectorAll('.btn-full-add, .btn-add-rapido').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = Number(btn.dataset.id);
      const produto = listaProdutos.find(p => p.id === id);
      if (produto) {
        Carrinho.adicionar(produto, 1);
        mostrarToast(`"${produto.nome}" adicionado ao carrinho!`, 'sucesso');
      }
    });
  });
}

/* ---------------- Home: destaques e mais vendidos ---------------- */
async function carregarSecoesHome() {
  const gridDestaques = document.getElementById('gridDestaques');
  const gridMaisVendidos = document.getElementById('gridMaisVendidos');
  const gridLancamentos = document.getElementById('gridLancamentos');

  if (gridDestaques) {
    try {
      const produtos = await apiFetch('/products/destaques');
      gridDestaques.innerHTML = produtos.length
        ? produtos.map(criarCardProduto).join('')
        : '<p class="mensagem-vazia">Nenhum produto em destaque no momento.</p>';
      ativarBotoesAdicionar(gridDestaques, produtos);
    } catch (err) { gridDestaques.innerHTML = `<p class="mensagem-vazia">${err.message}</p>`; }
  }

  if (gridMaisVendidos) {
    try {
      const produtos = await apiFetch('/products/mais-vendidos');
      gridMaisVendidos.innerHTML = produtos.length
        ? produtos.map(criarCardProduto).join('')
        : '<p class="mensagem-vazia">Ainda não há vendas registradas.</p>';
      ativarBotoesAdicionar(gridMaisVendidos, produtos);
    } catch (err) { gridMaisVendidos.innerHTML = `<p class="mensagem-vazia">${err.message}</p>`; }
  }

  if (gridLancamentos) {
    try {
      const produtos = await apiFetch('/products?lancamento=true');
      const lista = produtos.slice(0, 4);
      gridLancamentos.innerHTML = lista.length
        ? lista.map(criarCardProduto).join('')
        : '<p class="mensagem-vazia">Nenhum lançamento no momento.</p>';
      ativarBotoesAdicionar(gridLancamentos, lista);
    } catch (err) { gridLancamentos.innerHTML = `<p class="mensagem-vazia">${err.message}</p>`; }
  }
}

/* ---------------- Catálogo com filtros ---------------- */
let estadoFiltros = {};

function lerFiltrosDaURL() {
  const params = new URLSearchParams(window.location.search);
  estadoFiltros = {
    busca: params.get('busca') || '',
    categoria: params.get('categoria') || '',
    genero: params.get('genero') || '',
    lancamento: params.get('lancamento') || '',
    ordenar: params.get('ordenar') || 'mais_recentes'
  };
}

async function iniciarCatalogo() {
  const grid = document.getElementById('gridCatalogo');
  if (!grid) return;

  lerFiltrosDaURL();

  const [categorias, marcas] = await Promise.all([
    apiFetch('/products/categorias').catch(() => []),
    apiFetch('/products/marcas').catch(() => [])
  ]);

  montarFiltrosCategoria(categorias);
  montarFiltrosMarca(marcas);
  restaurarEstadoControles();
  await buscarECarregarProdutos();

  document.querySelectorAll('.filtro-checkbox').forEach(el => {
    el.addEventListener('change', aplicarFiltrosDeInterface);
  });
  document.getElementById('ordenarSelect')?.addEventListener('change', aplicarFiltrosDeInterface);
  document.getElementById('btnAplicarPreco')?.addEventListener('click', aplicarFiltrosDeInterface);
  document.getElementById('btnLimparFiltros')?.addEventListener('click', () => {
    window.location.href = '/produtos.html';
  });
}

function montarFiltrosCategoria(categorias) {
  const container = document.getElementById('filtroCategorias');
  if (!container) return;
  container.innerHTML = categorias.map(c => `
    <label class="filtro-opcao">
      <input type="radio" name="categoria" class="filtro-checkbox" value="${c.slug}">
      ${c.nome}
    </label>
  `).join('');
}

function montarFiltrosMarca(marcas) {
  const container = document.getElementById('filtroMarcas');
  if (!container) return;
  container.innerHTML = marcas.map(m => `
    <label class="filtro-opcao">
      <input type="radio" name="marca" class="filtro-checkbox" value="${m}">
      ${m}
    </label>
  `).join('');
}

function restaurarEstadoControles() {
  if (estadoFiltros.categoria) {
    const el = document.querySelector(`input[name="categoria"][value="${estadoFiltros.categoria}"]`);
    if (el) el.checked = true;
  }
  if (estadoFiltros.genero) {
    const el = document.querySelector(`input[name="genero"][value="${estadoFiltros.genero}"]`);
    if (el) el.checked = true;
  }
  if (estadoFiltros.lancamento) {
    const el = document.getElementById('filtroLancamento');
    if (el) el.checked = true;
  }
  const ordenarSelect = document.getElementById('ordenarSelect');
  if (ordenarSelect) ordenarSelect.value = estadoFiltros.ordenar;

  const tituloBusca = document.getElementById('tituloCatalogo');
  if (tituloBusca && estadoFiltros.busca) {
    tituloBusca.textContent = `Resultados para "${estadoFiltros.busca}"`;
  }
}

function aplicarFiltrosDeInterface() {
  const categoria = document.querySelector('input[name="categoria"]:checked')?.value || '';
  const marca = document.querySelector('input[name="marca"]:checked')?.value || '';
  const genero = document.querySelector('input[name="genero"]:checked')?.value || '';
  const lancamento = document.getElementById('filtroLancamento')?.checked;
  const precoMin = document.getElementById('precoMin')?.value;
  const precoMax = document.getElementById('precoMax')?.value;
  const ordenar = document.getElementById('ordenarSelect')?.value;

  estadoFiltros = { ...estadoFiltros, categoria, marca, genero, lancamento, precoMin, precoMax, ordenar };
  buscarECarregarProdutos();
}

async function buscarECarregarProdutos() {
  const grid = document.getElementById('gridCatalogo');
  const contagem = document.getElementById('resultadoContagem');
  grid.innerHTML = '<div class="loader"><div class="anel"></div></div>';

  const params = new URLSearchParams();
  Object.entries(estadoFiltros).forEach(([chave, valor]) => {
    if (valor) params.set(chave, valor);
  });

  try {
    const produtos = await apiFetch(`/products?${params.toString()}`);
    if (contagem) contagem.textContent = `${produtos.length} produto(s) encontrado(s)`;

    grid.innerHTML = produtos.length
      ? produtos.map(criarCardProduto).join('')
      : `<div class="estado-vazio"><i class="fa-solid fa-flask"></i><p>Nenhum perfume encontrado com esses filtros.</p></div>`;

    ativarBotoesAdicionar(grid, produtos);
  } catch (err) {
    grid.innerHTML = `<div class="estado-vazio"><p>${err.message}</p></div>`;
  }
}

/* ---------------- Página de detalhes do produto ---------------- */
async function iniciarPaginaProduto() {
  const container = document.getElementById('produtoDetalheContainer');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { window.location.href = '/produtos.html'; return; }

  try {
    const { produto, relacionados } = await apiFetch(`/products/${id}`);
    renderizarDetalheProduto(produto);
    renderizarRelacionados(relacionados);
  } catch (err) {
    container.innerHTML = `<div class="estado-vazio"><p>${err.message}</p></div>`;
  }
}

function renderizarDetalheProduto(produto) {
  document.title = `${produto.nome} — Áurea Beauty`;

  const temPromo = produto.preco_promocional && Number(produto.preco_promocional) < Number(produto.preco);
  const precoFinal = temPromo ? produto.preco_promocional : produto.preco;
  const disponivel = produto.estoque > 0;
  const imagem = produto.imagem || 'https://placehold.co/600x600/f0e2c3/6b6459?text=Áurea+Beauty';

  document.getElementById('produtoImagem').src = imagem;
  document.getElementById('produtoImagem').alt = produto.nome;
  document.getElementById('produtoMarca').textContent = produto.marca;
  document.getElementById('produtoNome').textContent = produto.nome;
  document.getElementById('produtoCategoria').textContent = produto.categoria_nome || '—';
  document.getElementById('produtoVolume').textContent = `${produto.volume_ml}ml`;
  document.getElementById('produtoGenero').textContent =
    produto.genero.charAt(0).toUpperCase() + produto.genero.slice(1);
  document.getElementById('produtoDescricao').textContent = produto.descricao;

  document.getElementById('precoAntigo').textContent = temPromo ? formatarPreco(produto.preco) : '';
  document.getElementById('precoAntigo').style.display = temPromo ? 'inline' : 'none';
  document.getElementById('precoAtual').textContent = formatarPreco(precoFinal);

  const dispEl = document.getElementById('produtoDisponibilidade');
  dispEl.className = `produto-disponibilidade ${disponivel ? 'disponivel' : 'indisponivel'}`;
  dispEl.innerHTML = disponivel
    ? `<i class="fa-solid fa-circle"></i> Em estoque (${produto.estoque} unidades)`
    : `<i class="fa-solid fa-circle"></i> Produto indisponível`;

  const inputQtd = document.getElementById('inputQuantidade');
  inputQtd.max = produto.estoque;
  inputQtd.value = disponivel ? 1 : 0;

  document.getElementById('btnDiminuirQtd').addEventListener('click', () => {
    inputQtd.value = Math.max(1, Number(inputQtd.value) - 1);
  });
  document.getElementById('btnAumentarQtd').addEventListener('click', () => {
    inputQtd.value = Math.min(produto.estoque, Number(inputQtd.value) + 1);
  });

  const btnAdd = document.getElementById('btnAdicionarCarrinho');
  btnAdd.disabled = !disponivel;
  btnAdd.addEventListener('click', () => {
    const qtd = Number(inputQtd.value) || 1;
    Carrinho.adicionar(produto, qtd);
    mostrarToast(`"${produto.nome}" adicionado ao carrinho!`, 'sucesso');
  });
}

function renderizarRelacionados(relacionados) {
  const grid = document.getElementById('gridRelacionados');
  const secao = document.getElementById('secaoRelacionados');
  if (!grid) return;
  if (!relacionados.length) { if (secao) secao.style.display = 'none'; return; }
  grid.innerHTML = relacionados.map(criarCardProduto).join('');
  ativarBotoesAdicionar(grid, relacionados);
}

document.addEventListener('DOMContentLoaded', () => {
  carregarSecoesHome();
  iniciarCatalogo();
  iniciarPaginaProduto();
});
