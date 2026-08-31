const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/produtoController');
const { autenticar, apenasAdmin } = require('../middleware/auth');
const { validarProduto } = require('../middleware/validacao');
const upload = require('../middleware/upload');

// Rotas públicas
router.get('/marcas', ProdutoController.marcas);
router.get('/categorias', ProdutoController.categorias);
router.get('/mais-vendidos', ProdutoController.maisVendidos);
router.get('/destaques', ProdutoController.destaques);
router.get('/admin/todos', autenticar, apenasAdmin, ProdutoController.listarAdmin);
router.get('/', ProdutoController.listar);
router.get('/:id', ProdutoController.buscarPorId);

// Rotas administrativas (protegidas)
router.post('/', autenticar, apenasAdmin, upload.single('imagem'), validarProduto, ProdutoController.criar);
router.put('/:id', autenticar, apenasAdmin, upload.single('imagem'), validarProduto, ProdutoController.atualizar);
router.delete('/:id', autenticar, apenasAdmin, ProdutoController.excluir);

module.exports = router;
