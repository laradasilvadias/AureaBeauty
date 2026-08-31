// Funções simples de validação de dados de entrada

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCadastro(req, res, next) {
  const { nome, email, senha, confirmarSenha } = req.body;

  if (!nome || nome.trim().length < 3) {
    return res.status(400).json({ erro: 'Informe um nome completo válido.' });
  }
  if (!email || !validarEmail(email)) {
    return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  }
  if (!senha || senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
  }
  if (senha !== confirmarSenha) {
    return res.status(400).json({ erro: 'As senhas não coincidem.' });
  }
  next();
}

function validarLogin(req, res, next) {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe e-mail e senha.' });
  }
  next();
}

function validarProduto(req, res, next) {
  const { nome, marca, volume_ml, preco, estoque } = req.body;
  if (!nome || !marca || !volume_ml || preco === undefined || estoque === undefined) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios do produto.' });
  }
  if (Number(preco) <= 0) {
    return res.status(400).json({ erro: 'O preço deve ser maior que zero.' });
  }
  if (Number(estoque) < 0) {
    return res.status(400).json({ erro: 'O estoque não pode ser negativo.' });
  }
  next();
}

module.exports = { validarCadastro, validarLogin, validarProduto, validarEmail };
