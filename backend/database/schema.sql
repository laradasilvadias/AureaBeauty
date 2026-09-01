

CREATE DATABASE IF NOT EXISTS aurea_beauty
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aurea_beauty;

-- Tabela: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  cpf VARCHAR(14),
  tipo ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabela: enderecos
CREATE TABLE IF NOT EXISTS enderecos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  cep VARCHAR(9),
  logradouro VARCHAR(200),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  principal TINYINT(1) DEFAULT 1,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela: categorias
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Tabela: produtos
CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  categoria_id INT,
  genero ENUM('feminino', 'masculino', 'unissex') NOT NULL DEFAULT 'unissex',
  descricao TEXT,
  volume_ml INT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  preco_promocional DECIMAL(10,2) DEFAULT NULL,
  estoque INT NOT NULL DEFAULT 0,
  imagem VARCHAR(255) DEFAULT NULL,
  destaque TINYINT(1) DEFAULT 0,
  lancamento TINYINT(1) DEFAULT 0,
  vendidos INT DEFAULT 0,
  ativo TINYINT(1) DEFAULT 1,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabela: pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  endereco_id INT,
  data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
  valor_total DECIMAL(10,2) NOT NULL,
  forma_pagamento ENUM('pix', 'cartao', 'boleto') NOT NULL,
  status ENUM(
    'aguardando_pagamento',
    'pagamento_aprovado',
    'em_preparacao',
    'enviado',
    'entregue',
    'cancelado'
  ) NOT NULL DEFAULT 'aguardando_pagamento',
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (endereco_id) REFERENCES enderecos(id)
) ENGINE=InnoDB;

-- Tabela: itens_pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
) ENGINE=InnoDB;

-- Índices úteis
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_produtos_genero ON produtos(genero);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_itens_pedido_pedido ON itens_pedido(pedido_id);
