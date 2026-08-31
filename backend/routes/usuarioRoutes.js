const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');
const { autenticar } = require('../middleware/auth');

router.get('/profile', autenticar, UsuarioController.perfil);
router.put('/profile', autenticar, UsuarioController.atualizarPerfil);
router.put('/senha', autenticar, UsuarioController.alterarSenha);
router.post('/endereco', autenticar, UsuarioController.salvarEndereco);
router.get('/pedidos', autenticar, UsuarioController.meusPedidos);

module.exports = router;
