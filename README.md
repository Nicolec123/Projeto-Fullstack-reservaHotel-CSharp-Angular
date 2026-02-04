# Hotel Manager — Sistema de Reservas

Sistema de reservas de hotel com autenticação JWT, backend em **C# ASP.NET Web API** e frontend em **Angular**.

## Estrutura

- **HotelManager.API** — Backend (ASP.NET Core, Entity Framework, SQL Server, JWT)
- **hotel-manager-frontend** — Frontend (Angular 18)

## Pré-requisitos

- .NET 10 SDK (ou 8+)
- Node.js 18+
- SQL Server LocalDB (já vem com Visual Studio) ou SQL Server Express

## Backend

```bash
cd HotelManager.API
dotnet restore
dotnet run
```

A API sobe em **http://localhost:5001**.  
Documentação OpenAPI: **http://localhost:5001/openapi/v1.json**

### Banco de dados

O projeto usa **SQLite por padrão** (arquivo `HotelManager.db` criado automaticamente).  
O projeto usa **EnsureCreated** na inicialização: o banco é criado automaticamente na primeira execução.

**SQLite (padrão):**
```json
"DefaultConnection": "Data Source=HotelManager.db"
```

**SQL Server (opcional):**  
Se você tiver SQL Server/LocalDB instalado, altere em `appsettings.json`:
```json
"DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=HotelManagerDb;Trusted_Connection=True;MultipleActiveResultSets=true"
```

### Usuário admin (seed)

- **Email:** admin@hotel.com  
- **Senha:** Admin@123  

## Frontend

```bash
cd hotel-manager-frontend
npm install
npm start
```

O app abre em **http://localhost:4200**.  
A URL da API está configurada em `src/app/core/constants/api.ts` (padrão: `http://localhost:5001/api`).

## Funcionalidades

### Hóspede (User)
- Cadastro e login
- Listar quartos e ver disponibilidade por período
- Fazer reserva (com validação de conflito de datas)
- Cancelar reserva
- Ver histórico de reservas

### Administrador (Admin)
- Tudo do hóspede
- Cadastrar quartos (número, tipo, preço)
- Bloquear/desbloquear quartos
- Ver todas as reservas
- Listar usuários

## Tecnologias

**Backend:** ASP.NET Core, Entity Framework Core, SQL Server, JWT (Bearer), BCrypt, Swagger  
**Frontend:** Angular 18, standalone components, signals, reactive forms, guards, HTTP interceptor (JWT no header)

## Nome sugerido para repositório

- `hotel-reservation-api`
- `hotel-manager-system`
- `hotel-booking-platform`
