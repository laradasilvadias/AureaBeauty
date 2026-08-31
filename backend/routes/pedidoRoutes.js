const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/pedidoController');
const { autenticar } = require('../middleware/auth');

router.post('/', autenticar, PedidoController.criar);
router.get('/', autenticar, PedidoController.listar);
router.get('/:id', autenticar, PedidoController.buscarPorId);

module.exports = router;
