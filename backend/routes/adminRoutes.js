const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { autenticar, apenasAdmin } = require('../middleware/auth');

router.use(autenticar, apenasAdmin);

router.get('/dashboard', AdminController.dashboard);
router.get('/users', AdminController.listarClientes);
router.get('/orders', AdminController.listarPedidos);
router.put('/orders/:id/status', AdminController.atualizarStatusPedido);

module.exports = router;
