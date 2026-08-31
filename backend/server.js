require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { testarConexao } = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', usuarioRoutes);
app.use('/api/products', produtoRoutes);
app.use('/api/orders', pedidoRoutes);
app.use('/api/admin', adminRoutes);

// Rota de verificação de status da API
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', app: 'ÁUREA BEAUTY API' });
});

// Fallback: qualquer rota não-API retorna o index.html (SPA-like para navegação simples)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'), (err) => {
    if (err) next();
  });
});

// Tratamento de erros do multer / gerais
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: err.message || 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`\n💛 ÁUREA BEAUTY - servidor rodando em http://localhost:${PORT}`);
  await testarConexao();
});
