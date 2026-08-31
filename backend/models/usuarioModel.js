const { pool } = require('../config/database');

const UsuarioModel = {
  async criar({ nome, email, senhaHash, telefone, cpf, tipo = 'cliente' }) {
    const [result] = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, telefone, cpf, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, email, senhaHash, telefone || null, cpf || null, tipo]
    );
    return result.insertId;
  },

  async buscarPorEmail(email) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0];
  },

  async buscarPorId(id) {
    const [rows] = await pool.query(
      'SELECT id, nome, email, telefone, cpf, tipo, ativo, criado_em FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async atualizar(id, { nome, telefone, cpf }) {
    await pool.query(
      'UPDATE usuarios SET nome = ?, telefone = ?, cpf = ? WHERE id = ?',
      [nome, telefone, cpf, id]
    );
  },

  async atualizarSenha(id, senhaHash) {
    await pool.query('UPDATE usuarios SET senha = ? WHERE id = ?', [senhaHash, id]);
  },

  async listarClientes() {
    const [rows] = await pool.query(
      `SELECT id, nome, email, telefone, ativo, criado_em
       FROM usuarios WHERE tipo = 'cliente' ORDER BY criado_em DESC`
    );
    return rows;
  },

  async contarClientes() {
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM usuarios WHERE tipo = 'cliente'");
    return rows[0].total;
  }
};

module.exports = UsuarioModel;
