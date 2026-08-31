const { pool } = require('../config/database');
const ProdutoModel = require('./produtoModel');

const PedidoModel = {
  // Cria o pedido de forma transacional: valida estoque, insere pedido, itens e baixa o estoque
  async criarPedido({ usuarioId, enderecoId, itens, formaPagamento }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Valida estoque e calcula total
      let valorTotal = 0;
      const itensValidados = [];

      for (const item of itens) {
        const [rows] = await conn.query(
          'SELECT id, nome, preco, preco_promocional, estoque FROM produtos WHERE id = ? FOR UPDATE',
          [item.produtoId]
        );
        const produto = rows[0];
        if (!produto) throw new Error(`Produto ${item.produtoId} não encontrado`);
        if (produto.estoque < item.quantidade) {
          throw new Error(`Estoque insuficiente para "${produto.nome}". Disponível: ${produto.estoque}`);
        }
        const precoUnitario = produto.preco_promocional || produto.preco;
        const subtotal = precoUnitario * item.quantidade;
        valorTotal += subtotal;
        itensValidados.push({ ...item, precoUnitario, subtotal });
      }

      const [pedidoResult] = await conn.query(
        `INSERT INTO pedidos (usuario_id, endereco_id, valor_total, forma_pagamento, status)
         VALUES (?, ?, ?, ?, 'aguardando_pagamento')`,
        [usuarioId, enderecoId || null, valorTotal, formaPagamento]
      );
      const pedidoId = pedidoResult.insertId;

      for (const item of itensValidados) {
        await conn.query(
          `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [pedidoId, item.produtoId, item.quantidade, item.precoUnitario, item.subtotal]
        );
        await ProdutoModel.baixarEstoque(item.produtoId, item.quantidade, conn);
      }

      // Simulação: pagamento é aprovado automaticamente para fins acadêmicos
      await conn.query(
        `UPDATE pedidos SET status = 'pagamento_aprovado' WHERE id = ?`,
        [pedidoId]
      );

      await conn.commit();
      return { pedidoId, valorTotal };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async listarPorUsuario(usuarioId) {
    const [pedidos] = await pool.query(
      'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY data_pedido DESC',
      [usuarioId]
    );
    for (const pedido of pedidos) {
      const [itens] = await pool.query(
        `SELECT ip.*, p.nome, p.imagem FROM itens_pedido ip
         JOIN produtos p ON ip.produto_id = p.id WHERE ip.pedido_id = ?`,
        [pedido.id]
      );
      pedido.itens = itens;
    }
    return pedidos;
  },

  async buscarPorId(id, usuarioId = null) {
    let sql = 'SELECT * FROM pedidos WHERE id = ?';
    const params = [id];
    if (usuarioId) {
      sql += ' AND usuario_id = ?';
      params.push(usuarioId);
    }
    const [rows] = await pool.query(sql, params);
    const pedido = rows[0];
    if (!pedido) return null;
    const [itens] = await pool.query(
      `SELECT ip.*, p.nome, p.imagem FROM itens_pedido ip
       JOIN produtos p ON ip.produto_id = p.id WHERE ip.pedido_id = ?`,
      [id]
    );
    pedido.itens = itens;
    return pedido;
  },

  async listarTodos() {
    const [rows] = await pool.query(
      `SELECT pe.*, u.nome AS cliente_nome, u.email AS cliente_email
       FROM pedidos pe JOIN usuarios u ON pe.usuario_id = u.id
       ORDER BY pe.data_pedido DESC`
    );
    for (const pedido of rows) {
      const [itens] = await pool.query(
        `SELECT ip.*, p.nome FROM itens_pedido ip
         JOIN produtos p ON ip.produto_id = p.id WHERE ip.pedido_id = ?`,
        [pedido.id]
      );
      pedido.itens = itens;
    }
    return rows;
  },

  async atualizarStatus(id, status) {
    await pool.query('UPDATE pedidos SET status = ? WHERE id = ?', [status, id]);
  },

  async recentes(limite = 5) {
    const [rows] = await pool.query(
      `SELECT pe.*, u.nome AS cliente_nome FROM pedidos pe
       JOIN usuarios u ON pe.usuario_id = u.id
       ORDER BY pe.data_pedido DESC LIMIT ?`,
      [limite]
    );
    return rows;
  },

  async contarTotal() {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM pedidos');
    return rows[0].total;
  },

  async somaVendas() {
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(valor_total), 0) AS total FROM pedidos WHERE status != 'cancelado'`
    );
    return rows[0].total;
  }
};

module.exports = PedidoModel;
