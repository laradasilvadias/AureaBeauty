const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validarCadastro, validarLogin } = require('../middleware/validacao');

router.post('/register', validarCadastro, AuthController.registrar);
router.post('/login', validarLogin, AuthController.login);
router.post('/admin/login', validarLogin, AuthController.loginAdmin);

module.exports = router;
