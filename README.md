# 💛 Áurea Beauty — E-commerce de Perfumes

Projeto acadêmico de um e-commerce completo de perfumes, com **frontend em HTML, CSS e JavaScript puro**, **backend em Node.js/Express** e **banco de dados relacional MySQL**.

---

## 📖 Sobre o projeto

Áurea Beauty é uma loja virtual de perfumes com identidade visual premium (dourado, champagne e off-white), contendo:

- Catálogo de perfumes com filtros e ordenação;
- Cadastro/login de clientes com autenticação segura (JWT + bcrypt);
- Carrinho de compras e checkout simulado (Pix, cartão, boleto);
- Controle de estoque automático;
- Área do cliente ("Minha Conta") com histórico de pedidos;
- Painel administrativo completo com dashboard, CRUD de perfumes, gestão de pedidos e clientes.

O projeto foi desenvolvido para fins de apresentação em trabalho de faculdade, com código organizado, comentado e fácil de explicar.

---

## 🛠️ Tecnologias utilizadas

**Frontend:** HTML5, CSS3, JavaScript puro (sem frameworks)
**Backend:** Node.js, Express.js
**Banco de dados:** MySQL (via driver `mysql2`)
**Autenticação:** JWT (`jsonwebtoken`) + hash de senha com `bcryptjs`
**Upload de imagens:** `multer`
**Variáveis de ambiente:** `dotenv`

---

## ✅ Requisitos para executar

- [Node.js](https://nodejs.org/) versão 18 ou superior
- [MySQL](https://dev.mysql.com/downloads/) versão 8 (ou compatível) instalado e em execução
- NPM (já vem junto com o Node.js)

---

## 🚀 Passo a passo para rodar o projeto

### 1. Instalar as dependências

Na raiz do projeto, execute:

```bash
npm install
```

### 3. Criar o banco de dados

Com o MySQL em execução, rode o script de criação das tabelas:

```bash
mysql -u root -p < backend/database/schema.sql
```

Isso irá criar o banco `aurea_beauty` e todas as tabelas necessárias (`usuarios`, `produtos`, `categorias`, `pedidos`, `itens_pedido`, `enderecos`).

### 4. Popular o banco com dados iniciais (seed)

Este passo cria categorias, 12 perfumes de exemplo e o usuário administrador inicial:

```bash
npm run seed
```

Você verá uma mensagem de sucesso ao final, confirmando a criação dos dados.

### 5. Executar o backend

Para rodar em modo produção:

```bash
npm start
```

Para rodar em modo desenvolvimento (reinício automático a cada alteração, requer `nodemon`):

```bash
npm run dev
```

O servidor iniciará em `http://localhost:3000`.

### 6. Acessar o frontend

O backend já serve o frontend automaticamente. Basta abrir o navegador em:

```
http://localhost:3000
```

Não é necessário nenhum servidor adicional — o Express serve os arquivos estáticos da pasta `frontend/`.

---

## 🔑 Credenciais de teste

> Estas credenciais são apenas para fins de **desenvolvimento e apresentação acadêmica**. Não utilize em produção.

**Administrador (painel administrativo em `/admin/login.html`):**
- E-mail: `admin@aureabeauty.com`
- Senha: `admin123`

**Cliente:** crie uma conta pela página `/cadastro.html`, ou utilize o login normal após o cadastro.

---

## 🗂️ Estrutura do projeto

```text
aurea-beauty/
│
├── frontend/                  # HTML, CSS e JS puro (servidos pelo Express)
│   ├── index.html             # Home
│   ├── produtos.html          # Catálogo com filtros
│   ├── produto.html           # Detalhes do perfume
│   ├── login.html
│   ├── cadastro.html
│   ├── carrinho.html
│   ├── checkout.html
│   ├── pedido-confirmado.html
│   ├── minha-conta.html
│   ├── sobre.html
│   │
│   ├── admin/                 # Painel administrativo
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── produtos.html      # CRUD de perfumes
│   │   ├── pedidos.html
│   │   └── usuarios.html
│   │
│   ├── css/
│   │   ├── style.css          # Estilo principal (identidade visual)
│   │   ├── responsive.css     # Responsividade (tablet/mobile)
│   │   └── admin.css          # Estilo do painel administrativo
│   │
│   ├── js/
│   │   ├── app.js             # Utilitários: API, sessão, carrinho, header
│   │   ├── auth.js            # Login e cadastro
│   │   ├── produtos.js        # Home, catálogo e detalhes do produto
│   │   ├── carrinho.js        # Carrinho e checkout
│   │   ├── conta.js           # Área do cliente
│   │   └── admin.js           # Painel administrativo
│   │
│   └── assets/
│       ├── logo.jpg
│       └── imagens/           # Imagens dos perfumes (seed)
│
├── backend/
│   ├── server.js              # Ponto de entrada do Express
│   ├── config/
│   │   └── database.js        # Conexão (pool) com MySQL
│   ├── controllers/           # Lógica das rotas
│   ├── routes/                # Definição dos endpoints REST
│   ├── models/                # Acesso ao banco de dados (queries)
│   ├── middleware/             # Autenticação, validação, upload
│   └── database/
│       ├── schema.sql         # Script de criação das tabelas
│       └── seed.js            # Popula o banco com dados iniciais
│
├── .env.example                # Modelo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

---

## 🌐 Principais endpoints da API

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cadastro de cliente |
| POST | `/api/auth/login` | Login de cliente |
| POST | `/api/auth/admin/login` | Login de administrador |

### Usuários (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/users/profile` | Dados do perfil |
| PUT | `/api/users/profile` | Atualizar dados pessoais |
| PUT | `/api/users/senha` | Alterar senha |
| POST | `/api/users/endereco` | Cadastrar endereço |
| GET | `/api/users/pedidos` | Histórico de pedidos |

### Produtos
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/products` | Listar produtos (com filtros/ordenação via query string) |
| GET | `/api/products/:id` | Detalhes de um produto |
| GET | `/api/products/categorias` | Listar categorias |
| GET | `/api/products/marcas` | Listar marcas |
| GET | `/api/products/destaques` | Produtos em destaque |
| GET | `/api/products/mais-vendidos` | Produtos mais vendidos |
| POST | `/api/products` | Cadastrar produto *(admin)* |
| PUT | `/api/products/:id` | Editar produto *(admin)* |
| DELETE | `/api/products/:id` | Remover produto *(admin)* |

### Pedidos (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/orders` | Criar pedido (checkout) |
| GET | `/api/orders` | Listar pedidos do cliente |
| GET | `/api/orders/:id` | Detalhes de um pedido |

### Administração *(somente admin)*
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/dashboard` | Estatísticas gerais |
| GET | `/api/admin/users` | Listar clientes |
| GET | `/api/admin/orders` | Listar todos os pedidos |
| PUT | `/api/admin/orders/:id/status` | Atualizar status do pedido |

---

## 🔒 Segurança implementada

- Senhas com **hash bcrypt** (nunca armazenadas em texto puro);
- Autenticação via **JSON Web Token (JWT)**;
- Middlewares de **proteção de rotas administrativas**;
- **Queries parametrizadas** (mysql2) para evitar SQL Injection;
- Validação de dados de entrada (cadastro, login, produtos);
- Variáveis sensíveis isoladas no arquivo `.env` (fora do controle de versão);
- Transações no banco de dados ao finalizar pedidos, garantindo consistência entre estoque e pedido.

---

## 🧭 Fluxo funcional do sistema

**Cliente:** Cadastro → Login → Catálogo → Detalhes do produto → Carrinho → Checkout → Pedido salvo no banco → Estoque atualizado automaticamente.

**Administrador:** Login administrativo → Dashboard → Cadastro de novo perfume → Produto salvo no banco → Produto aparece imediatamente no catálogo do site.

---

## 🧪 Principais funcionalidades

- ✅ Catálogo dinâmico com filtros (categoria, marca, gênero, preço, lançamentos) e ordenação
- ✅ Página de detalhes com produtos relacionados
- ✅ Cadastro/login com senha criptografada
- ✅ Área do cliente com dados pessoais, endereços, troca de senha e histórico de pedidos
- ✅ Carrinho persistente (localStorage) com atualização de quantidade e remoção
- ✅ Checkout com seleção de endereço e forma de pagamento simulada
- ✅ Verificação e baixa automática de estoque via transação no banco
- ✅ Painel administrativo com dashboard (totais, estoque baixo, pedidos recentes)
- ✅ CRUD completo de perfumes com upload de imagem
- ✅ Gerenciamento de pedidos com alteração de status
- ✅ Visualização de clientes cadastrados (sem exposição de senhas)
- ✅ Layout responsivo (desktop, tablet e mobile)

---

## 👩‍💻 Autoria

Projeto desenvolvido como trabalho acadêmico — Áurea Beauty © 2026.
