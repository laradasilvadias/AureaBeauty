const { pool } = require('../config/database');

const ProdutoModel = {
  // Busca produtos com filtros opcionais e ordenação
  async listar(filtros = {}) {
    let sql = `
      SELECT p.*, c.nome AS categoria_nome, c.slug AS categoria_slug
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.ativo = 1
    `;
    const params = [];

    if (filtros.categoria) {
      sql += ' AND c.slug = ?';
      params.push(filtros.categoria);
    }
    if (filtros.marca) {
      sql += ' AND p.marca = ?';
      params.push(filtros.marca);
    }
    if (filtros.genero) {
      sql += ' AND p.genero = ?';
      params.push(filtros.genero);
    }
    if (filtros.precoMin) {
      sql += ' AND COALESCE(p.preco_promocional, p.preco) >= ?';
      params.push(filtros.precoMin);
    }
    if (filtros.precoMax) {
      sql += ' AND COALESCE(p.preco_promocional, p.preco) <= ?';
      params.push(filtros.precoMax);
    }
    if (filtros.lancamento) {
      sql += ' AND p.lancamento = 1';
    }
    if (filtros.destaque) {
      sql += ' AND p.destaque = 1';
    }
    if (filtros.busca) {
      sql += ' AND (p.nome LIKE ? OR p.marca LIKE ? OR p.descricao LIKE ?)';
      const termo = `%${filtros.busca}%`;
      params.push(termo, termo, termo);
    }

    switch (filtros.ordenar) {
      case 'menor_preco':
        sql += ' ORDER BY COALESCE(p.preco_promocional, p.preco) ASC';
        break;
      case 'maior_preco':
        sql += ' ORDER BY COALESCE(p.preco_promocional, p.preco) DESC';
        break;
      case 'mais_recentes':
        sql += ' ORDER BY p.criado_em DESC';
        break;
      case 'mais_vendidos':
        sql += ' ORDER BY p.vendidos DESC';
        break;
      default:
        sql += ' ORDER BY p.criado_em DESC';
    }

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT p.*, c.nome AS categoria_nome, c.slug AS categoria_slug
       FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  },

  async relacionados(categoriaId, produtoIdExcluir, limite = 4) {
    const [rows] = await pool.query(
      `SELECT * FROM produtos WHERE categoria_id = ? AND id != ? AND ativo = 1 LIMIT ?`,
      [categoriaId, produtoIdExcluir, limite]
    );
    return rows;
  },

  async maisVendidos(limite = 8) {
    const [rows] = await pool.query(
      'SELECT * FROM produtos WHERE ativo = 1 ORDER BY vendidos DESC LIMIT ?',
      [limite]
    );
    return rows;
  },

  async destaques(limite = 8) {
    const [rows] = await pool.query(
      'SELECT * FROM produtos WHERE ativo = 1 AND destaque = 1 LIMIT ?',
      [limite]
    );
    return rows;
  },

  async listarMarcas() {
    const [rows] = await pool.query(
      'SELECT DISTINCT marca FROM produtos WHERE ativo = 1 ORDER BY marca'
    );
    return rows.map(r => r.marca);
  },

  async criar(dados) {
    const {
      nome, marca, categoria_id, genero, descricao, volume_ml,
      preco, preco_promocional, estoque, imagem, destaque, lancamento
    } = dados;
    const [result] = await pool.query(
      `INSERT INTO produtos
       (nome, marca, categoria_id, genero, descricao, volume_ml, preco, preco_promocional, estoque, imagem, destaque, lancamento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, marca, categoria_id || null, genero, descricao, volume_ml,
       preco, preco_promocional || null, estoque, imagem || null,
       destaque ? 1 : 0, lancamento ? 1 : 0]
    );
    return result.insertId;
  },

  async atualizar(id, dados) {
    const {
      nome, marca, categoria_id, genero, descricao, volume_ml,
      preco, preco_promocional, estoque, imagem, destaque, lancamento
    } = dados;
    const campos = [
      'nome=?', 'marca=?', 'categoria_id=?', 'genero=?', 'descricao=?', 'volume_ml=?',
      'preco=?', 'preco_promocional=?', 'estoque=?', 'destaque=?', 'lancamento=?'
    ];
    const params = [
      nome, marca, categoria_id || null, genero, descricao, volume_ml,
      preco, preco_promocional || null, estoque, destaque ? 1 : 0, lancamento ? 1 : 0
    ];
    if (imagem) {
      campos.push('imagem=?');
      params.push(imagem);
    }
    params.push(id);
    await pool.query(`UPDATE produtos SET ${campos.join(', ')} WHERE id=?`, params);
  },

  async excluir(id) {
    // Exclusão lógica para preservar o histórico de pedidos
    await pool.query('UPDATE produtos SET ativo = 0 WHERE id = ?', [id]);
  },

  async verificarEstoque(id) {
    const [rows] = await pool.query('SELECT estoque FROM produtos WHERE id = ?', [id]);
    return rows[0] ? rows[0].estoque : 0;
  },

  async baixarEstoque(id, quantidade, conn = pool) {
    await conn.query(
      'UPDATE produtos SET estoque = estoque - ?, vendidos = vendidos + ? WHERE id = ?',
      [quantidade, quantidade, id]
    );
  },

  async estoqueBaixo(limite = 5) {
    const [rows] = await pool.query(
      'SELECT * FROM produtos WHERE ativo = 1 AND estoque <= ? ORDER BY estoque ASC',
      [limite]
    );
    return rows;
  },

  async contarTotal() {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM produtos WHERE ativo = 1');
    return rows[0].total;
  },

  async listarTodosAdmin() {
    const [rows] = await pool.query(
      `SELECT p.*, c.nome AS categoria_nome FROM produtos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       ORDER BY p.criado_em DESC`
    );
    return rows;
  }
};

module.exports = ProdutoModel;
