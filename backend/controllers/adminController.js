const ProdutoModel = require('../models/produtoModel');
const UsuarioModel = require('../models/usuarioModel');
const PedidoModel = require('../models/pedidoModel');

const AdminController = {
  async dashboard(req, res) {
    try {
      const [totalProdutos, totalClientes, totalPedidos, valorVendas, estoqueBaixo, pedidosRecentes] =
        await Promise.all([
          ProdutoModel.contarTotal(),
          UsuarioModel.contarClientes(),
          PedidoModel.contarTotal(),
          PedidoModel.somaVendas(),
          ProdutoModel.estoqueBaixo(5),
          PedidoModel.recentes(5)
        ]);

      res.json({
        totalProdutos,
        totalClientes,
        totalPedidos,
        valorVendas,
        estoqueBaixo,
        pedidosRecentes
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao carregar dashboard.' });
    }
  },

  async listarClientes(req, res) {
    try {
      const clientes = await UsuarioModel.listarClientes();
      res.json(clientes);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao listar clientes.' });
    }
  },

  async listarPedidos(req, res) {
    try {
      const pedidos = await PedidoModel.listarTodos();
      res.json(pedidos);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao listar pedidos.' });
    }
  },

  async atualizarStatusPedido(req, res) {
    try {
      const { status } = req.body;
      const statusValidos = [
        'aguardando_pagamento', 'pagamento_aprovado', 'em_preparacao', 'enviado', 'entregue', 'cancelado'
      ];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({ erro: 'Status inválido.' });
      }
      await PedidoModel.atualizarStatus(req.params.id, status);
      res.json({ mensagem: 'Status do pedido atualizado com sucesso!' });
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao atualizar status do pedido.' });
    }
  }
};

module.exports = AdminController;
