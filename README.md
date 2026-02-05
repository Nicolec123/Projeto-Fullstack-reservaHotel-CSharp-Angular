# Hotel Manager — Sistema de Reservas de Hotel

Sistema completo de reservas de hotel com backend em **ASP.NET Core 10**, frontend em **Angular 18**, autenticação JWT, testes automatizados, Docker e logs estruturados. Ideal para portfólio e demonstração de maturidade técnica.

---

## Índice

- [Visão geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Decisões técnicas e trade-offs](#decisões-técnicas-e-trade-offs)
- [Segurança](#segurança)
- [Pré-requisitos e execução](#pré-requisitos-e-execução)
- [Testes](#testes)
- [Docker](#docker)
- [Logs e monitoramento](#logs-e-monitoramento)
- [Deploy](#deploy)
- [Documentação detalhada](#documentação-detalhada)

---

## Visão geral

O **Hotel Manager** permite:

- **Hóspedes**: cadastro, login, consulta de quartos e disponibilidade, reservas, cancelamento e histórico.
- **Colaboradores** (Admin, Gerente, Recepcionista): gestão de quartos, bloqueio, listagem de reservas e usuários.
- **Módulo Spa**: pacotes promocionais e agendamento.

### Stack

| Camada      | Tecnologia |
|------------|------------|
| Backend    | ASP.NET Core 10, Entity Framework Core 8, SQLite / SQL Server, JWT, BCrypt, Serilog |
| Frontend   | Angular 18, standalone components, signals, reactive forms |
| Testes     | xUnit, Moq (unit), WebApplicationFactory (integration), Cypress (e2e) |
| Infra      | Docker, Docker Compose |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular 18)                          │
│  SPA, lazy loading, guards (auth, admin, client), JWT interceptor │
└────────────────────────────┬────────────────────────────────────┘
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (ASP.NET Core)                        │
│  Controllers → Services → Repositories → DbContext                │
│  Serilog (logs estruturados) + AuditMiddleware (audit trail)      │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                                │
│  SQLite (dev/padrão) ou SQL Server                               │
│  Users, Sessions, Rooms, Reservations, Guests                    │
└─────────────────────────────────────────────────────────────────┘
```

- **Backend**: API REST em camadas (Controller → Service → Repository). Injeção de dependência para testes e flexibilidade.
- **Frontend**: Single Page Application com rotas protegidas por guards e interceptor que envia o JWT no header `Authorization`.
- **Autenticação**: JWT Bearer; hóspedes podem usar refresh token (tabela `Sessions`) para sessão longa; admin/staff usa token de curta duração.

---

## Decisões técnicas e trade-offs

| Decisão | Motivo | Trade-off |
|--------|--------|-----------|
| **SQLite por padrão** | Zero configuração, portabilidade, adequado para demo e desenvolvimento. | Em produção com alto volume, SQL Server/PostgreSQL oferecem melhor concorrência e recursos. |
| **EnsureCreated em vez de migrations** | Inicialização simples, seed único no arranque. | Migrações explícitas (EF Migrations) são mais seguras para evolução do schema em produção. |
| **Refresh token em tabela Sessions** | Controle de sessões ativas, logout em todos os dispositivos, revogação. | Mais uma tabela e lógica; para apenas “lembrar de mim” poderia ser stateless com token longo. |
| **Dois fluxos de login (auth vs admin)** | Hóspede com refresh e UX de sessão longa; staff com sessão curta e sem refresh. | Dois endpoints; alternativa seria um único login com claims diferentes. |
| **Serilog + audit em middleware** | Logs estruturados e rastreabilidade de requisições (path, status, user, IP). | Audit em arquivo/console; para compliance forte, persistir em tabela ou sistema externo. |
| **Angular standalone** | Alinhado com a evolução do Angular (standalone-first). | Menos uso de NgModules; alguns recursos ainda podem usar módulos onde fizer sentido. |

---

## Segurança

- **Senhas**: apenas hash com BCrypt (nunca em texto plano).
- **JWT**: assinatura HMAC-SHA256; chave configurável via `appsettings` (em produção usar variável de ambiente ou cofre).
- **CORS**: origens explícitas em `Cors:Origins`; em produção restringir ao domínio do frontend.
- **Autorização**: endpoints protegidos por `[Authorize]` e `[Authorize(Roles = "...")]`; hóspede só acessa próprias reservas, staff conforme role.
- **Refresh token**: armazenado em hash na tabela `Sessions`; expiração e limpeza de sessões expiradas na inicialização.
- **Audit**: middleware registra método, path, status, duração, user id (quando autenticado) e IP para análise posterior.

Em produção: usar HTTPS, chave JWT forte e secreta, conexão segura ao banco e revisão periódica de permissões.

---

## Pré-requisitos e execução

- **.NET 10 SDK** (ou 8+)
- **Node.js 18+**
- **npm** ou **yarn**

### Backend

```bash
cd HotelManager.API
dotnet restore
dotnet run
```

- API: **http://localhost:5001**
- OpenAPI: **http://localhost:5001/openapi/v1.json** (em Development)

### Frontend

```bash
cd hotel-manager-frontend
npm install
npm start
```

- App: **http://localhost:4200**
- API base: `src/app/core/constants/api.ts` → `http://localhost:5001/api`

### Credenciais padrão (seed)

| Perfil   | Email             | Senha      |
|----------|-------------------|------------|
| Admin    | admin@hotel.com   | Admin@123  |
| Hóspede  | hospede@hotel.com | Hospede@123 |

---

## Testes

### Unit tests (backend)

```bash
cd HotelManager.API.Tests
dotnet test
```

- **xUnit** + **Moq**; cobrem serviços (ex.: `AuthService`, `RoomService`) com dependências mockadas.

### Integration tests (API)

```bash
cd HotelManager.API.IntegrationTests
dotnet test
```

- **WebApplicationFactory** + SQLite in-memory; testes de endpoints reais (auth, rooms).

### E2E (frontend)

```bash
cd hotel-manager-frontend
npm install
npm run e2e        # headless
npm run e2e:open  # Cypress UI
```

- **Cypress**; cenários de home, login e quartos. A API deve estar rodando em `http://localhost:5001` e o app em `http://localhost:4200`.

---

## Docker

Containerização da API, do frontend e do banco (SQLite em volume).

```bash
# Na raiz do repositório
docker compose up --build
```

- **API**: porta **5001** (interno 8080); volume `dbdata` para `HotelManager.db`.
- **Frontend**: porta **4200** (nginx servindo o build Angular).

Variáveis de ambiente (opcional): `JWT_KEY` para a chave JWT. Para usar PostgreSQL em produção, descomente o serviço `db` no `docker-compose.yml` e ajuste a connection string da API.

---

## Logs e monitoramento

- **Serilog**: logs estruturados em console e em arquivo (`logs/hotelmanager-*.log`, rotação diária, 7 dias).
- **Request logging**: `UseSerilogRequestLogging` com enriquecimento (ex.: UserId).
- **Audit trail**: `AuditMiddleware` registra para cada requisição: método, path, status, duração, UserId (quando autenticado) e IP.

Exemplo de linha de audit no log:

```text
Audit: GET /api/rooms => 200 em 45ms | UserId=(anon) | Ip=::1
```

---

## Deploy

Hospedagem sugerida para impacto em portfólio:

- **Backend em cloud**: Azure App Service, AWS Elastic Beanstalk ou similar (API .NET).
- **Frontend em domínio**: Vercel, Netlify ou Azure Static Web Apps (build Angular, apontando para a URL da API).
- **Banco remoto**: Azure SQL, AWS RDS ou PostgreSQL gerenciado; alterar connection string e, se usar EF Migrations, rodar migrations no deploy.

Detalhes, variáveis de ambiente e checklist estão em **[DEPLOY.md](./DEPLOY.md)**.

---

## Documentação detalhada

Para fluxos, endpoints, modelos de dados, guards e configuração completa, consulte **[DOCUMENTACAO-PROJETO.md](./DOCUMENTACAO-PROJETO.md)**.

---

## Estrutura do repositório

```text
├── HotelManager.API/           # Backend ASP.NET Core
├── HotelManager.API.Tests/     # Unit tests (xUnit, Moq)
├── HotelManager.API.IntegrationTests/
├── hotel-manager-frontend/    # Angular 18 + Cypress e2e
├── docker-compose.yml
├── README.md
├── DEPLOY.md
└── DOCUMENTACAO-PROJETO.md
```

---

## Licença

Uso educacional e portfólio.
