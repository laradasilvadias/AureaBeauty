// Script para popular o banco de dados com dados iniciais de teste
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const categorias = [
  { nome: 'Florais', slug: 'florais' },
  { nome: 'Amadeirados', slug: 'amadeirados' },
  { nome: 'Cítricos', slug: 'citricos' },
  { nome: 'Orientais', slug: 'orientais' },
  { nome: 'Aquáticos', slug: 'aquaticos' }
];

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('🌱 Iniciando o seed do banco de dados...');

    // Categorias
    const categoriaIds = {};
    for (const cat of categorias) {
      const [existe] = await conn.query('SELECT id FROM categorias WHERE slug = ?', [cat.slug]);
      if (existe.length) {
        categoriaIds[cat.slug] = existe[0].id;
      } else {
        const [result] = await conn.query(
          'INSERT INTO categorias (nome, slug) VALUES (?, ?)',
          [cat.nome, cat.slug]
        );
        categoriaIds[cat.slug] = result.insertId;
      }
    }
    console.log('✔ Categorias criadas.');

    // Produtos
    const [produtosExistentes] = await conn.query('SELECT COUNT(*) AS total FROM produtos');
    if (produtosExistentes[0].total === 0) {
      for (const p of produtos) {
        await conn.query(
          `INSERT INTO produtos
           (nome, marca, categoria_id, genero, descricao, volume_ml, preco, preco_promocional, estoque, imagem, destaque, lancamento)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.nome, p.marca, categoriaIds[p.categoriaSlug], p.genero, p.descricao,
            p.volume_ml, p.preco, p.preco_promocional, p.estoque, p.imagem,
            p.destaque, p.lancamento
          ]
        );
      }
      console.log('✔ Perfumes de exemplo cadastrados.');
    } else {
      console.log('ℹ Produtos já existem, pulando inserção.');
    }

    // Admin inicial
    const [adminExiste] = await conn.query('SELECT id FROM usuarios WHERE email = ?', ['admin@aureabeauty.com']);
    if (!adminExiste.length) {
      const senhaHash = await bcrypt.hash('admin123', 10);
      await conn.query(
        `INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, 'admin')`,
        ['Administrador Áurea', 'admin@aureabeauty.com', senhaHash]
      );
      console.log('✔ Usuário administrador criado (admin@aureabeauty.com / admin123).');
    } else {
      console.log('ℹ Administrador já existe, pulando criação.');
    }

    console.log('\n🎉 Seed finalizado com sucesso!\n');
  } catch (err) {
    console.error('❌ Erro ao executar o seed:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
