# Documentação Detalhada do Projeto — Hotel Manager

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Backend (HotelManager.API)](#3-backend-hotelmanagerapi)
4. [Frontend (hotel-manager-frontend)](#4-frontend-hotel-manager-frontend)
5. [Autenticação e Autorização](#5-autenticação-e-autorização)
6. [Fluxos Principais](#6-fluxos-principais)
7. [Banco de Dados](#7-banco-de-dados)
8. [Funcionalidades por Perfil](#8-funcionalidades-por-perfil)
9. [Configuração e Execução](#9-configuração-e-execução)

---

## 1. Visão Geral

O **Hotel Manager** é um sistema completo de reservas de hotel que permite:

- **Hóspedes** cadastrarem-se, realizarem login, visualizarem quartos e disponibilidade, fazer reservas, cancelar reservas e consultar o histórico.
- **Colaboradores** (Admin, Gerente, Recepcionista) gerenciarem quartos, bloquearem quartos, visualizarem todas as reservas e listarem usuários.
- **Spa** — módulo promocional com pacotes (Relaxamento Total, Fim de Semana Wellness, Lua de Mel Spa) e agendamento.

### Tecnologias Principais

| Camada | Tecnologia |
|--------|------------|
| **Backend** | ASP.NET Core 10, Entity Framework Core 8, SQLite (padrão) / SQL Server, JWT, BCrypt, OpenAPI |
| **Frontend** | Angular 18, standalone components, signals, reactive forms, flatpickr |
| **Autenticação** | JWT Bearer, refresh tokens, sessões |

---

## 2. Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular 18)                         │
│  http://localhost:4200                                           │
│  - SPA com lazy loading                                          │
│  - Guards: auth, admin, client                                   │
│  - Interceptor: JWT no header Authorization                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (ASP.NET Core)                        │
│  http://localhost:5001                                           │
│  - Controllers: Auth, Admin, Rooms, Reservations                 │
│  - Services: Auth, Room, Reservation, Payment, Email             │
│  - Repositories: User, Session, Room, Reservation                │
│  - Autenticação JWT Bearer                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                                │
│  SQLite (HotelManager.db) ou SQL Server                          │
│  Tabelas: Users, Sessions, Rooms, Reservations, Guests           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Backend (HotelManager.API)

### 3.1 Estrutura de Pastas

```
HotelManager.API/
├── Auth/                    # Serviço JWT
│   ├── IJwtService.cs
│   └── JwtService.cs
├── Controllers/
│   ├── AdminController.cs   # Login admin, colaboradores, usuários
│   ├── AuthController.cs    # Login hóspede, registro, refresh, logout
│   ├── ReservationsController.cs
│   └── RoomsController.cs
├── Data/
│   └── ApplicationDbContext.cs
├── DTOs/
│   ├── Auth/                # LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest
│   ├── Common/              # PagedResult<T>
│   ├── Reservation/         # ReservationDto, CreateReservationRequest, GuestDto
│   ├── Room/                # RoomDto, CreateRoomRequest, UpdateRoomRequest
│   └── User/                # UserDto, CreateCollaboratorRequest
├── Models/
│   ├── User.cs
│   ├── Session.cs
│   ├── Room.cs
│   ├── Reservation.cs
│   └── Guest.cs
├── Repositories/
│   ├── IUserRepository, UserRepository
│   ├── ISessionRepository, SessionRepository
│   ├── IRoomRepository, RoomRepository
│   └── IReservationRepository, ReservationRepository
├── Services/
│   ├── IAuthService, AuthService
│   ├── IRoomService, RoomService
│   ├── IReservationService, ReservationService
│   ├── IPaymentService, PaymentService
│   └── IEmailService, EmailService
├── Program.cs
└── appsettings.json
```

### 3.2 Modelos de Domínio

#### User
- **Id**, **Nome**, **Email**, **SenhaHash**, **Role** (Admin, Gerente, Recepcionista, User)
- **Ativo**, **UltimoLogin**, **TwoFactorEnabled**, **HotelId** (multi-hotel futuro)
- Dados pessoais: Telefone, CPF, DataNascimento, Nacionalidade, Endereco, Cidade, País, IdiomaPreferido
- Preferências: TipoCamaPreferido, AndarAlto, QuartoSilencioso, NaoFumante, Acessibilidade, PreferenciaAlimentar

#### Room
- **Id**, **Numero**, **Tipo** (Standard, Luxo, Suíte), **PrecoDiaria**, **Bloqueado**

#### Reservation
- **Id**, **UserId**, **RoomId**, **DataInicio**, **DataFim**, **Status** (Confirmada, Cancelada, Concluída, Pendente)
- **Adultos**, **Criancas**, **Pets**, **Observacoes**
- Pagamento: **MetodoPagamento**, **StatusPagamento**, **ValorTotal**, **CodigoPix**, **CodigoBoleto**, **TokenPagamento**, **DataPagamento**

#### Guest
- **Id**, **ReservationId**, **Nome**, **Cpf**, **DataNascimento**, **Nacionalidade**, **Telefone**, **Tipo** (Adulto, Criança), **Idade**

#### Session
- **Id**, **SessionId** (Guid), **UserId**, **RefreshTokenHash**, **Ip**, **Device**, **ExpiresAt**, **CreatedAt**
- Usado para refresh token e controle de sessões ativas

### 3.3 Controllers e Endpoints

#### AuthController (`/api/auth`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/login` | Login de hóspede. Suporta `lembrarDeMim` para refresh token de até 30 dias. |
| POST | `/register` | Cadastro de novo hóspede. Retorna token e refresh token. |
| POST | `/refresh` | Renova access token usando refresh token. |
| POST | `/logout` | Invalida sessão (refresh token). |

#### AdminController (`/api/admin`)

| Método | Rota | Autorização | Descrição |
|--------|------|-------------|-----------|
| POST | `/login` | Público | Login de admin/staff. Sem refresh token. |
| POST | `/collaborators` | Admin | Cria colaborador (Gerente ou Recepcionista). |
| GET | `/users` | Admin, Gerente | Lista usuários paginados. |

#### RoomsController (`/api/rooms`)

| Método | Rota | Autorização | Descrição |
|--------|------|-------------|-----------|
| GET | `/` | Público | Lista quartos paginados. |
| GET | `/{id}` | Público | Detalhes do quarto. |
| GET | `/available` | Público | Quartos disponíveis por período (dataInicio, dataFim). |
| POST | `/` | Admin, Gerente | Cria quarto. |
| PUT | `/{id}` | Admin, Gerente, Recepcionista | Atualiza quarto. |

#### ReservationsController (`/api/reservations`)

| Método | Rota | Autorização | Descrição |
|--------|------|-------------|-----------|
| GET | `/my` | Autenticado | Minhas reservas. |
| GET | `/all` | Admin, Gerente, Recepcionista | Todas as reservas. |
| GET | `/{id}` | Autenticado | Detalhes da reserva (própria ou staff). |
| POST | `/` | Autenticado | Cria reserva. |
| POST | `/{id}/cancel` | Autenticado | Cancela reserva. |

### 3.4 Serviços Principais

- **AuthService**: Login (guest e admin), registro, refresh token, logout, criação de colaboradores. Usa BCrypt para senha e JwtService para tokens.
- **RoomService**: CRUD de quartos, verificação de disponibilidade.
- **ReservationService**: Criação com validação de conflito de datas, cálculo de valor (hospedagem + crianças + pets), integração com PaymentService e EmailService.
- **PaymentService**: Simulação de pagamento (Cartão, Pix, Boleto).
- **EmailService**: Envio de e-mails (simulado ou real).

### 3.5 Seed na Inicialização

- **Admin**: `admin@hotel.com` / `Admin@123`
- **Hóspede teste**: `hospede@hotel.com` / `Hospede@123`
- **Quartos**: 5 quartos iniciais (1–2 Standard R$150, 3–4 Luxo R$250, 5 Suíte R$400)
- Limpeza de sessões expiradas

---

## 4. Frontend (hotel-manager-frontend)

### 4.1 Estrutura de Pastas

```
src/app/
├── app.component.*
├── app.config.ts
├── app.routes.ts
├── core/
│   ├── constants/           # api, room-images, spa-packages, etc.
│   ├── guards/              # auth, admin, client
│   ├── interceptors/        # auth (JWT no header)
│   └── services/            # api, auth, search
├── features/
│   ├── admin/
│   ├── auth/                # login, register
│   ├── home/
│   ├── info/                # about, contact, gallery, policies, services
│   ├── reservations/        # simular, reserve, my-reservations
│   ├── rooms/               # room-list, room-detail
│   └── spa/                 # spa-booking, spa-package-detail, spa-promotional-package
└── shared/
    ├── footer/
    └── search-bar/
```

### 4.2 Rotas

| Rota | Componente | Proteção |
|------|------------|----------|
| `/` | Home | Público |
| `/quartos` | RoomList | Público |
| `/quartos/:id` | RoomDetail | Público |
| `/quartos/:id/simular` | Simular | Público |
| `/reservar/:id` | Reserve | authGuard, clientGuard |
| `/minhas-reservas` | MyReservations | authGuard |
| `/admin` | Admin | authGuard, adminGuard |
| `/login` | Login | Público |
| `/cadastro` | Register | Público |
| `/spa/agendar` | SpaBooking | Público |
| `/spa/pacote/:id` | SpaPromotionalPackage | Público |
| `/spa/pacote/:id/detalhes` | SpaPackageDetail | Público |
| `/sobre`, `/servicos`, `/galeria`, `/contato`, `/politicas` | Info | Público |

### 4.3 Guards

- **authGuard**: Exige login. Redireciona para `/login` com `returnUrl`.
- **adminGuard**: Exige role Admin, Gerente ou Recepcionista. Redireciona para `/quartos` se não for staff.
- **clientGuard**: Usado em `/reservar/:id`. Só hóspedes (User) podem reservar. Colaboradores são redirecionados para `/quartos`.

### 4.4 Serviços

- **ApiService**: Métodos HTTP para rooms, reservations, admin (users, collaborators).
- **AuthService**: `loginGuest`, `loginAdmin`, `register`, `refreshToken`, `logout`. Usa signals para `currentUser`, `isAdmin`, `isStaff`, `isHospede`, `isGuest`, `isLoggedIn`.
- **SearchService**: Compartilhamento de critérios de busca entre componentes.

### 4.5 Módulo Spa

- **Pacotes**: Relaxamento Total (R$890), Fim de Semana Wellness (R$1.690), Lua de Mel Spa (R$2.490).
- **Constantes**: `spa-packages.ts`, `spa-package-details.ts`, `spa-addons.ts`, `spa-pillars.ts`, `spa-booking-packages.ts`.
- **Componentes**: Visualização de pacotes, detalhes, agendamento. Funcionalidade promocional e de agendamento (sem backend específico ainda).

---

## 5. Autenticação e Autorização

### 5.1 Fluxo de Login Hóspede

1. `POST /api/auth/login` com `email`, `senha`, `lembrarDeMim`.
2. Validação de senha com BCrypt.
3. Geração de access token JWT (60 min padrão).
4. Se `lembrarDeMim`: geração de refresh token, gravação na tabela `Sessions`, retorno de `refreshToken` e `refreshTokenExpiresAt`.
5. Retorno de `AuthResponse` com token, refreshToken (opcional), dados do usuário, tipo `guest`.

### 5.2 Fluxo de Login Admin/Staff

1. `POST /api/admin/login` com `email`, `senha`.
2. Apenas roles Admin, Gerente ou Recepcionista.
3. Access token com validade de 8 horas (480 min).
4. Sem refresh token.
5. Retorno com tipo `admin` e `permissions`.

### 5.3 Refresh Token (Hóspede)

1. `POST /api/auth/refresh` com `refreshToken`.
2. Hash do token é comparado com `Sessions.RefreshTokenHash`.
3. Sessão antiga é invalidada.
4. Nova sessão criada com novo refresh token.
5. Novo access token retornado.

### 5.4 JWT

- **Guest**: claims `NameIdentifier`, `Email`, `Name`, `Role`, `tipo=guest`.
- **Admin**: claims adicionais `tipo=admin`, `permissions`, opcional `hotel_id`.
- **Assinatura**: HMAC-SHA256, chave em `appsettings.json`.

---

## 6. Fluxos Principais

### 6.1 Reserva de Quarto

1. Usuário acessa `/quartos` ou `/quartos/:id/simular`.
2. Define período (dataInicio, dataFim) e consulta disponibilidade via `GET /api/rooms/available`.
3. Em `/reservar/:id`, preenche dados (adultos, crianças, pets, observações, método de pagamento).
4. `POST /api/reservations` com body da reserva.
5. Backend valida datas, quarto não bloqueado, sem conflito de reservas.
6. Calcula valor: `diarias × precoDiaria + criancas × taxa + pets × taxa`.
7. Processa pagamento (simulado) e envia e-mail de confirmação (se configurado).
8. Retorna reserva criada.

### 6.2 Cancelamento

1. Usuário em `/minhas-reservas` ou painel admin.
2. `POST /api/reservations/{id}/cancel`.
3. Status atualizado para `Cancelada`.

---

## 7. Banco de Dados

### 7.1 Conexão

- **Padrão**: SQLite (`Data Source=HotelManager.db`).
- **Opcional**: SQL Server em `appsettings.json` (connection string `SqlServerConnection`).

### 7.2 Tabelas

- **Users**: usuários e colaboradores.
- **Sessions**: sessões ativas para refresh token.
- **Rooms**: quartos.
- **Reservations**: reservas.
- **Guests**: hóspedes adicionais por reserva.

### 7.3 Migrations

- Usa `EnsureCreated` na inicialização (banco criado automaticamente).
- Para SQLite: script auxiliar cria tabela `Sessions` e colunas extras em `Users` se necessário.

---

## 8. Funcionalidades por Perfil

| Funcionalidade | Hóspede (User) | Recepcionista | Gerente | Admin |
|----------------|----------------|---------------|---------|-------|
| Cadastro/Login | Sim | Login admin | Login admin | Login admin |
| Ver quartos e disponibilidade | Sim | Sim | Sim | Sim |
| Fazer reserva | Sim | Não (painel) | Não | Não |
| Minhas reservas | Sim | Sim | Sim | Sim |
| Todas as reservas | Não | Sim | Sim | Sim |
| Cancelar reserva (própria) | Sim | Sim | Sim | Sim |
| Cadastrar quartos | Não | Não | Sim | Sim |
| Atualizar quartos | Não | Sim | Sim | Sim |
| Listar usuários | Não | Não | Sim | Sim |
| Criar colaboradores | Não | Não | Não | Sim |

---

## 9. Configuração e Execução

### 9.1 Pré-requisitos

- .NET 10 SDK (ou 8+)
- Node.js 18+
- Angular CLI (opcional)

### 9.2 Backend

```bash
cd HotelManager.API
dotnet restore
dotnet run
```

- API: **http://localhost:5001**
- OpenAPI: **http://localhost:5001/openapi/v1.json**

### 9.3 Frontend

```bash
cd hotel-manager-frontend
npm install
npm start
```

- Aplicação: **http://localhost:4200**
- API configurada em `src/app/core/constants/api.ts` → `http://localhost:5001/api`

### 9.4 Credenciais Padrão

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@hotel.com | Admin@123 |
| Hóspede | hospede@hotel.com | Hospede@123 |

### 9.5 CORS

- Origens permitidas em `appsettings.json` → `Cors:Origins` (padrão: `http://localhost:4200`).

---

## Resumo

O projeto **Hotel Manager** é um sistema de reservas de hotel completo, com backend em ASP.NET Core e frontend em Angular 18. Oferece autenticação robusta (JWT + refresh token para hóspedes, sessão curta para staff), gestão de quartos e reservas, múltiplos perfis de usuário e um módulo promocional de spa. O banco padrão é SQLite, com suporte opcional a SQL Server.
