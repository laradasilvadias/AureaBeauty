const bcrypt = require('bcryptjs');
const UsuarioModel = require('../models/usuarioModel');
const EnderecoModel = require('../models/enderecoModel');
const PedidoModel = require('../models/pedidoModel');

const UsuarioController = {
  async perfil(req, res) {
    try {
      const usuario = await UsuarioModel.buscarPorId(req.usuario.id);
      const enderecos = await EnderecoModel.buscarPorUsuario(req.usuario.id);
      res.json({ usuario, enderecos });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao carregar perfil.' });
    }
  },

  async atualizarPerfil(req, res) {
    try {
      const { nome, telefone, cpf } = req.body;
      if (!nome || nome.trim().length < 3) {
        return res.status(400).json({ erro: 'Informe um nome válido.' });
      }
      await UsuarioModel.atualizar(req.usuario.id, { nome, telefone, cpf });
      const usuario = await UsuarioModel.buscarPorId(req.usuario.id);
      res.json({ mensagem: 'Dados atualizados com sucesso!', usuario });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao atualizar dados.' });
    }
  },

  async alterarSenha(req, res) {
    try {
      const { senhaAtual, novaSenha } = req.body;
      if (!novaSenha || novaSenha.length < 6) {
        return res.status(400).json({ erro: 'A nova senha deve ter no mínimo 6 caracteres.' });
      }
      const usuario = await UsuarioModel.buscarPorEmail(req.usuario.email);
      const senhaOk = await bcrypt.compare(senhaAtual, usuario.senha);
      if (!senhaOk) {
        return res.status(401).json({ erro: 'Senha atual incorreta.' });
      }
      const novaHash = await bcrypt.hash(novaSenha, 10);
      await UsuarioModel.atualizarSenha(req.usuario.id, novaHash);
      res.json({ mensagem: 'Senha alterada com sucesso!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao alterar senha.' });
    }
  },

  async salvarEndereco(req, res) {
    try {
      const enderecoId = await EnderecoModel.criar(req.usuario.id, req.body);
      res.status(201).json({ mensagem: 'Endereço salvo com sucesso!', enderecoId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao salvar endereço.' });
    }
  },

  async meusPedidos(req, res) {
    try {
      const pedidos = await PedidoModel.listarPorUsuario(req.usuario.id);
      res.json(pedidos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao buscar pedidos.' });
    }
  }
};

module.exports = UsuarioController;
