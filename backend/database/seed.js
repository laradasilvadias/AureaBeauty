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

const produtos = [
  {
    nome: 'Aurea Gold Elixir', marca: 'Áurea Beauty', categoriaSlug: 'orientais',
    genero: 'feminino', descricao: 'Um perfume envolvente com notas de âmbar, baunilha e um toque dourado de ylang-ylang. Sofisticação em cada borrifada.',
    volume_ml: 100, preco: 389.90, preco_promocional: 329.90, estoque: 24,
    imagem: '/assets/imagens/perfume-1.jpg', destaque: 1, lancamento: 1
  },
  {
    nome: 'Rose Champagne', marca: 'Maison Dourée', categoriaSlug: 'florais',
    genero: 'feminino', descricao: 'Fragrância floral com rosas búlgaras e um final espumante de champagne, ideal para ocasiões especiais.',
    volume_ml: 75, preco: 299.90, preco_promocional: null, estoque: 18,
    imagem: '/assets/imagens/perfume-2.jpg', destaque: 1, lancamento: 0
  },
  {
    nome: 'Noir Intense', marca: 'Black Essence', categoriaSlug: 'amadeirados',
    genero: 'masculino', descricao: 'Perfume amadeirado e intenso, com notas de couro, cedro e pimenta negra. Marcante e sofisticado.',
    volume_ml: 100, preco: 349.90, preco_promocional: 299.90, estoque: 30,
    imagem: '/assets/imagens/perfume-3.jpg', destaque: 1, lancamento: 0
  },
  {
    nome: 'Citrus Bloom', marca: 'Fresh & Co', categoriaSlug: 'citricos',
    genero: 'unissex', descricao: 'Combinação refrescante de limão siciliano, bergamota e flor de laranjeira. Perfeito para o dia a dia.',
    volume_ml: 50, preco: 189.90, preco_promocional: null, estoque: 40,
    imagem: '/assets/imagens/perfume-4.jpg', destaque: 0, lancamento: 1
  },
  {
    nome: 'Ocean Whisper', marca: 'Blue Wave', categoriaSlug: 'aquaticos',
    genero: 'masculino', descricao: 'Notas aquáticas e amadeiradas que remetem à brisa do mar. Leve, moderno e energizante.',
    volume_ml: 100, preco: 259.90, preco_promocional: 219.90, estoque: 22,
    imagem: '/assets/imagens/perfume-5.jpg', destaque: 0, lancamento: 1
  },
  {
    nome: 'Velvet Orchid', marca: 'Maison Dourée', categoriaSlug: 'florais',
    genero: 'feminino', descricao: 'Orquídeas negras e almíscar branco criam uma fragrância aveludada e magnética.',
    volume_ml: 75, preco: 419.90, preco_promocional: null, estoque: 15,
    imagem: '/assets/imagens/perfume-6.jpg', destaque: 1, lancamento: 0
  },
  {
    nome: 'Golden Amber', marca: 'Áurea Beauty', categoriaSlug: 'orientais',
    genero: 'unissex', descricao: 'Âmbar dourado, cardamomo e sândalo se unem em uma fragrância quente e envolvente.',
    volume_ml: 100, preco: 359.90, preco_promocional: 309.90, estoque: 20,
    imagem: '/assets/imagens/perfume-7.jpg', destaque: 0, lancamento: 0
  },
  {
    nome: 'Cedar & Musk', marca: 'Black Essence', categoriaSlug: 'amadeirados',
    genero: 'masculino', descricao: 'Cedro do Atlas e almíscar branco em uma composição amadeirada elegante e duradoura.',
    volume_ml: 100, preco: 329.90, preco_promocional: null, estoque: 28,
    imagem: '/assets/imagens/perfume-8.jpg', destaque: 0, lancamento: 0
  },
  {
    nome: 'Lemon Verbena', marca: 'Fresh & Co', categoriaSlug: 'citricos',
    genero: 'unissex', descricao: 'Frescor cítrico de limão e erva-cidreira com um leve fundo verde. Ideal para o verão.',
    volume_ml: 50, preco: 159.90, preco_promocional: 129.90, estoque: 35,
    imagem: '/assets/imagens/perfume-9.jpg', destaque: 0, lancamento: 1
  },
  {
    nome: 'Aurea Blanc', marca: 'Áurea Beauty', categoriaSlug: 'florais',
    genero: 'feminino', descricao: 'Jasmim branco, peônia e um toque de baunilha em um perfume delicado e luminoso.',
    volume_ml: 75, preco: 379.90, preco_promocional: null, estoque: 26,
    imagem: '/assets/imagens/perfume-10.jpg', destaque: 1, lancamento: 1
  },
  {
    nome: 'Deep Sea', marca: 'Blue Wave', categoriaSlug: 'aquaticos',
    genero: 'masculino', descricao: 'Notas marinhas intensas com toques de sal e madeira à deriva. Frescor duradouro.',
    volume_ml: 100, preco: 279.90, preco_promocional: null, estoque: 19,
    imagem: '/assets/imagens/perfume-11.jpg', destaque: 0, lancamento: 0
  },
  {
    nome: 'Spice Oriental', marca: 'Maison Dourée', categoriaSlug: 'orientais',
    genero: 'unissex', descricao: 'Especiarias quentes, canela e cravo combinadas com fundo de baunilha e âmbar.',
    volume_ml: 100, preco: 399.90, preco_promocional: 349.90, estoque: 12,
    imagem: '/assets/imagens/perfume-12.jpg', destaque: 0, lancamento: 0
  }
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
