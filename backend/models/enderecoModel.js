const { pool } = require('../config/database');

const EnderecoModel = {
  async criar(usuarioId, { cep, logradouro, numero, complemento, bairro, cidade, estado }) {
    const [result] = await pool.query(
      `INSERT INTO enderecos (usuario_id, cep, logradouro, numero, complemento, bairro, cidade, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [usuarioId, cep, logradouro, numero, complemento || null, bairro, cidade, estado]
    );
    return result.insertId;
  },

  async buscarPorUsuario(usuarioId) {
    const [rows] = await pool.query(
      'SELECT * FROM enderecos WHERE usuario_id = ? ORDER BY id DESC',
      [usuarioId]
    );
    return rows;
  },

  async buscarPorId(id) {
    const [rows] = await pool.query('SELECT * FROM enderecos WHERE id = ?', [id]);
    return rows[0];
  },

  async atualizar(id, dados) {
    const { cep, logradouro, numero, complemento, bairro, cidade, estado } = dados;
    await pool.query(
      `UPDATE enderecos SET cep=?, logradouro=?, numero=?, complemento=?, bairro=?, cidade=?, estado=? WHERE id=?`,
      [cep, logradouro, numero, complemento || null, bairro, cidade, estado, id]
    );
  }
};

module.exports = EnderecoModel;
