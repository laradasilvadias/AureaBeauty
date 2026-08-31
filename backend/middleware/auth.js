const jwt = require('jsonwebtoken');

// Verifica se o token JWT é válido e anexa os dados do usuário na requisição
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido. Faça login novamente.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, nome, email, tipo }
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Sessão expirada ou token inválido. Faça login novamente.' });
  }
}

// Deve ser usado APÓS o middleware "autenticar"
function apenasAdmin(req, res, next) {
  if (!req.usuario || req.usuario.tipo !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores.' });
  }
  next();
}

module.exports = { autenticar, apenasAdmin };
