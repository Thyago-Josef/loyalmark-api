
```markdown
# 🚀 LoyalMark API

![CI Status](https://github.com/Thyago-Josef/loyalmark-api/actions/workflows/ci.yml/badge.svg)

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A **LoyalMark API** é uma solução de fidelização multi-tenant desenvolvida com foco em alta escalabilidade, isolamento de dados e segurança rigorosa. A plataforma permite o gerenciamento isolado de ofertas, cupons e usuários para diferentes empresas em uma única instância de infraestrutura.

## 🛡️ Arquitetura de Segurança & Multi-tenancy

O sistema foi desenhado para ser resiliente a erros humanos e tentativas de manipulação de dados entre empresas (Tenants).

### 1. Isolamento de Dados (Tenant Isolation)
Utilizamos a estratégia de **Identificador por Coluna** (`companyId`). Todo o fluxo de dados é filtrado através de um sistema de `QueryScope` extraído automaticamente do JWT:
- **Filtro Automático:** Lojistas e funcionários são restritos apenas aos dados vinculados ao seu próprio `companyId`.
- **Impersonate Seguro:** Administradores Master podem "assumir" o contexto de uma empresa específica. Ao fazê-lo, recebem um token temporário que vincula todas as criações (ofertas, usuários) àquela empresa, garantindo rastreabilidade e integridade.

### 2. Blindagem de Endpoints (Imutabilidade)
Implementamos travas de segurança em nível de serviço para evitar ataques de *Mass Assignment* ou sequestro de contas:
- **Imutabilidade de Tenant:** O `companyId` de um registro é definido apenas no momento da criação. Em rotas de `PATCH` (Update), qualquer tentativa de alterar este campo é ignorada pelo serviço.
- **Proteção de Roles:** Usuários não podem elevar os seus próprios privilégios (`role`) através de rotas de atualização de perfil.
- **Sanitização de Dados:** Uso de desestruturação de objetos no Service para garantir que campos sensíveis ou nulos (como strings UUID vazias vindas do Swagger) não causem erros de integridade na base de dados.

### 3. Autenticação e Autorização
- **JWT (JSON Web Tokens):** Tokens assinados contendo metadados de escopo e IDs de usuário/empresa.
- **RBAC (Role-Based Access Control):** Controle de acesso baseado em níveis (Admin, Merchant, Customer).
- **Bcrypt:** Criptografia de alta segurança para todas as senhas.

## 🛠️ Stack Tecnológica

- **Framework:** [NestJS](https://nestjs.com/) (v10)
- **Banco de Dados:** PostgreSQL
- **Containerização:** Docker & Docker Compose
- **ORM:** [TypeORM](https://typeorm.io/)
- **Documentação:** Swagger (OpenAPI 3.0)
- **Testes:** [Jest](https://jestjs.io/)

## 🐳 Docker & Ambiente de Banco de Dados

O ambiente de banco de dados é totalmente containerizado para garantir paridade entre desenvolvimento e produção.

```bash
# Iniciar a base de dados PostgreSQL em segundo plano
$ docker-compose up -d

# Parar e remover os containers do projeto
$ docker-compose down
```

## 🚀 Como Executar

1. **Instalação:**
```bash
$ npm install
```

2. **Configuração (.env):**
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example` com as credenciais do banco e a chave secreta JWT.

3. **Rodar a aplicação:**
```bash
# Modo de desenvolvimento (com auto-reload)
$ npm run start:dev

# Modo de produção
$ npm run start:prod
```

A documentação interativa (Swagger) estará disponível em: `http://localhost:3000/api`

## 🧪 Qualidade & Testes (Jest)

A suíte de testes utiliza o **Jest** para validar as regras de multi-tenancy e integridade de dados.

```bash
# Testes unitários (Lógica de Serviços)
$ npm run test

# Testes End-to-End (E2E / Fluxos Completos)
$ npm run test:e2e

# Gerar relatório de cobertura de código
$ npm run test:cov
```

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---
