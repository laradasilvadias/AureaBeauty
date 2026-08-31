const { pool } = require('../config/database');

const CategoriaModel = {
  async listarTodas() {
    const [rows] = await pool.query('SELECT * FROM categorias ORDER BY nome');
    return rows;
  },

  async criar(nome, slug) {
    const [result] = await pool.query(
      'INSERT INTO categorias (nome, slug) VALUES (?, ?)',
      [nome, slug]
    );
    return result.insertId;
  },

  async buscarPorId(id) {
    const [rows] = await pool.query('SELECT * FROM categorias WHERE id = ?', [id]);
    return rows[0];
  }
};

module.exports = CategoriaModel;
