const PedidoModel = require('../models/pedidoModel');

const PedidoController = {
  async criar(req, res) {
    try {
      const { itens, enderecoId, formaPagamento } = req.body;

      if (!itens || !itens.length) {
        return res.status(400).json({ erro: 'O carrinho está vazio.' });
      }
      if (!formaPagamento) {
        return res.status(400).json({ erro: 'Selecione a forma de pagamento.' });
      }

      const resultado = await PedidoModel.criarPedido({
        usuarioId: req.usuario.id,
        enderecoId,
        itens,
        formaPagamento
      });

      const pedido = await PedidoModel.buscarPorId(resultado.pedidoId);
      res.status(201).json({ mensagem: 'Pedido realizado com sucesso!', pedido });
    } catch (err) {
      console.error(err);
      res.status(400).json({ erro: err.message || 'Erro ao finalizar pedido.' });
    }
  },

  async listar(req, res) {
    try {
      const pedidos = await PedidoModel.listarPorUsuario(req.usuario.id);
      res.json(pedidos);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao buscar pedidos.' });
    }
  },

  async buscarPorId(req, res) {
    try {
      const pedido = await PedidoModel.buscarPorId(req.params.id, req.usuario.id);
      if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });
      res.json(pedido);
    } catch (err) {
      res.status(500).json({ erro: 'Erro ao buscar pedido.' });
    }
  }
};

module.exports = PedidoController;
