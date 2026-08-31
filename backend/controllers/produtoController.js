const ProdutoModel = require('../models/produtoModel');
const CategoriaModel = require('../models/categoriaModel');

const ProdutoController = {
  async listar(req, res) {
    try {
      const filtros = {
        categoria: req.query.categoria,
        marca: req.query.marca,
        genero: req.query.genero,
        precoMin: req.query.precoMin,
        precoMax: req.query.precoMax,
        lancamento: req.query.lancamento === 'true',
        destaque: req.query.destaque === 'true',
        busca: req.query.busca,
        ordenar: req.query.ordenar
      };
      const produtos = await ProdutoModel.listar(filtros);
      res.json(produtos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao buscar produtos.' });
    }
  },

  async buscarPorId(req, res) {
    try {
      const produto = await ProdutoModel.buscarPorId(req.params.id);
      if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });

      const relacionados = produto.categoria_id
        ? await ProdutoModel.relacionados(produto.categoria_id, produto.id)
        : [];

      res.json({ produto, relacionados });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao buscar produto.' });
    }
  },

  async maisVendidos(req, res) {
    try {
      const produtos = await ProdutoModel.maisVendidos(8);
      res.json(produtos);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao buscar produtos mais vendidos.' });
    }
  },

  async destaques(req, res) {
    try {
      const produtos = await ProdutoModel.destaques(8);
      res.json(produtos);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao buscar produtos em destaque.' });
    }
  },

  async marcas(req, res) {
    try {
      const marcas = await ProdutoModel.listarMarcas();
      res.json(marcas);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao buscar marcas.' });
    }
  },

  async categorias(req, res) {
    try {
      const categorias = await CategoriaModel.listarTodas();
      res.json(categorias);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao buscar categorias.' });
    }
  },

  // ---- Rotas administrativas ----

  async criar(req, res) {
    try {
      const dados = { ...req.body };
      if (req.file) {
        dados.imagem = `/assets/imagens/${req.file.filename}`;
      }
      const id = await ProdutoModel.criar(dados);
      const produto = await ProdutoModel.buscarPorId(id);
      res.status(201).json({ mensagem: 'Perfume cadastrado com sucesso!', produto });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao cadastrar produto.' });
    }
  },

  async atualizar(req, res) {
    try {
      const dados = { ...req.body };
      if (req.file) {
        dados.imagem = `/assets/imagens/${req.file.filename}`;
      }
      await ProdutoModel.atualizar(req.params.id, dados);
      const produto = await ProdutoModel.buscarPorId(req.params.id);
      res.json({ mensagem: 'Perfume atualizado com sucesso!', produto });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao atualizar produto.' });
    }
  },

  async excluir(req, res) {
    try {
      await ProdutoModel.excluir(req.params.id);
      res.json({ mensagem: 'Perfume removido com sucesso!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao excluir produto.' });
    }
  },

  async listarAdmin(req, res) {
    try {
      const produtos = await ProdutoModel.listarTodosAdmin();
      res.json(produtos);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao listar produtos.' });
    }
  }
};

module.exports = ProdutoController;
