const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuarioModel');
const EnderecoModel = require('../models/enderecoModel');

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

const AuthController = {
  async registrar(req, res) {
    try {
      const { nome, email, senha, telefone, cpf, endereco } = req.body;

      const existente = await UsuarioModel.buscarPorEmail(email);
      if (existente) {
        return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
      }

      const senhaHash = await bcrypt.hash(senha, 10);
      const usuarioId = await UsuarioModel.criar({ nome, email, senhaHash, telefone, cpf, tipo: 'cliente' });

      if (endereco && endereco.cep) {
        await EnderecoModel.criar(usuarioId, endereco);
      }

      const usuario = await UsuarioModel.buscarPorId(usuarioId);
      const token = gerarToken(usuario);

      res.status(201).json({
        mensagem: 'Conta criada com sucesso!',
        token,
        usuario
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao criar conta. Tente novamente.' });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;
      const usuario = await UsuarioModel.buscarPorEmail(email);

      if (!usuario || !usuario.ativo) {
        return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) {
        return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
      }

      const token = gerarToken(usuario);
      delete usuario.senha;

      res.json({ mensagem: 'Login realizado com sucesso!', token, usuario });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao fazer login. Tente novamente.' });
    }
  },

  // Login exclusivo para administradores
  async loginAdmin(req, res) {
    try {
      const { email, senha } = req.body;
      const usuario = await UsuarioModel.buscarPorEmail(email);

      if (!usuario || usuario.tipo !== 'admin') {
        return res.status(401).json({ erro: 'Credenciais inválidas ou usuário sem permissão de administrador.' });
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      const token = gerarToken(usuario);
      delete usuario.senha;

      res.json({ mensagem: 'Login administrativo realizado com sucesso!', token, usuario });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao fazer login.' });
    }
  }
};

module.exports = AuthController;
