# Guia de Deploy — Hotel Manager

Este documento descreve como colocar o **Hotel Manager** em ambiente real: backend em cloud, frontend em domínio público e banco remoto. Um link público do projeto agrega muito ao portfólio.

---

## Visão geral do deploy

| Componente | Sugestão de hospedagem | Observação |
|------------|------------------------|------------|
| **API (backend)** | Azure App Service, AWS Elastic Beanstalk, Render, Fly.io | .NET 10 ou 8 runtime |
| **Frontend** | Vercel, Netlify, Azure Static Web Apps, GitHub Pages | Build estático (Angular) |
| **Banco de dados** | Azure SQL, AWS RDS, Supabase (PostgreSQL), ElephantSQL | Connection string remota |

---

## 1. Banco de dados remoto

### Opção A: PostgreSQL (Supabase / ElephantSQL / AWS RDS)

1. Crie um banco PostgreSQL e anote: host, porta, nome do banco, usuário e senha.
2. No backend, adicione o pacote (se ainda não tiver):
   ```bash
   dotnet add HotelManager.API package Npgsql.EntityFrameworkCore.PostgreSQL
   ```
3. Em **Program.cs**, use PostgreSQL quando a connection string contiver `Host=`:
   ```csharp
   if (connectionString.Contains("Host="))
       options.UseNpgsql(connectionString);
   else if (connectionString.Contains("Data Source=") && !connectionString.Contains("Server="))
       options.UseSqlite(connectionString);
   else
       options.UseSqlServer(connectionString);
   ```
4. Connection string (exemplo):
   ```text
   Host=seu-host.postgres.com;Port=5432;Database=HotelManagerDb;Username=user;Password=senha;SSL Mode=Require;
   ```
5. Em produção, use **EF Core Migrations** em vez de `EnsureCreated` para criar/atualizar tabelas.

### Opção B: Azure SQL / SQL Server

1. Crie um Azure SQL Database (ou SQL Server em outra cloud).
2. Use a connection string no formato:
   ```text
   Server=tcp:seu-servidor.database.windows.net,1433;Database=HotelManagerDb;User ID=user;Password=senha;Encrypt=True;
   ```
3. O projeto já suporta SQL Server via `UseSqlServer(connectionString)`.

---

## 2. Backend (API) em cloud

### Variáveis de ambiente (obrigatórias em produção)

Configure no painel da sua plataforma:

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `ConnectionStrings__DefaultConnection` | (connection string do banco) | Banco remoto |
| `Jwt__Key` | Chave forte com 32+ caracteres | **Nunca** usar a chave de desenvolvimento |
| `Jwt__Issuer` | HotelManager.API | Emissor do JWT |
| `Jwt__Audience` | HotelManager.Frontend | Audiência do JWT |
| `Cors__Origins__0` | https://seu-frontend.vercel.app | URL do frontend (uma por índice) |

### Exemplo: Azure App Service

1. Criar App Service (Runtime: .NET 8 ou 10).
2. Em **Configuration** → **Application settings**, definir as variáveis acima.
3. Deploy via GitHub Actions, Azure DevOps ou `az webapp deployment source config`.
4. URL da API: `https://seu-app.azurewebsites.net`.

### Exemplo: Render / Fly.io

1. Conectar repositório e definir **Dockerfile** (já existe em `HotelManager.API/Dockerfile`).
2. Configurar variáveis de ambiente no painel.
3. Para SQLite em volume: verificar se o plano permite volume persistente; caso contrário, usar banco remoto.

---

## 3. Frontend em domínio

### Build de produção

```bash
cd hotel-manager-frontend
npm ci
npm run build
```

O build gera a pasta `dist/` (ex.: `dist/hotel-manager-frontend/browser` no Angular 18).

### Apontar a API

O frontend chama a API pela constante `API_URL` em `src/app/core/constants/api.ts`. Para produção:

- **Opção 1**: Trocar para a URL pública da API, por exemplo:
  ```ts
  export const API_URL = 'https://sua-api.azurewebsites.net/api';
  ```
- **Opção 2**: Usar variável de ambiente no build (ex.: `environment.production` ou substituição em pipeline) para definir a base da API.

### Vercel

1. Conectar o repositório ao Vercel.
2. Root directory: `hotel-manager-frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist/hotel-manager-frontend/browser` (ou o que o `angular.json` definir).
5. Variáveis de ambiente (se usar): `NG_APP_API_URL` (ou similar) e configurar no `api.ts` via `environment`.

### Netlify

1. New site from Git → selecionar repositório.
2. Base directory: `hotel-manager-frontend`.
3. Build command: `npm run build`.
4. Publish directory: `dist/hotel-manager-frontend/browser`.
5. Adicionar redirect para SPA: `/* /index.html 200`.

---

## 4. CORS

No backend, em produção, inclua **apenas** a origem do frontend em `Cors:Origins`, por exemplo:

```json
"Cors": {
  "Origins": ["https://seu-app.vercel.app", "https://www.seu-dominio.com"]
}
```

Ou via variáveis: `Cors__Origins__0`, `Cors__Origins__1`, etc.

---

## 5. Checklist pré-deploy

- [ ] Banco remoto criado e connection string testada.
- [ ] `Jwt:Key` forte e único (não usar a do `appsettings.json` de dev).
- [ ] CORS restrito à URL do frontend.
- [ ] Frontend buildado com a URL correta da API.
- [ ] HTTPS em todos os acessos (API e frontend).
- [ ] Logs (Serilog) e audit trail conferidos (ex.: nível de log, retenção).

---

## 6. Link público

Após o deploy:

- **Frontend**: `https://seu-app.vercel.app` (ou o domínio escolhido).
- **API**: `https://sua-api.azurewebsites.net` (ou a URL do backend).
- No README e no portfólio, use o link do **frontend** para quem for testar o sistema.

Com isso você demonstra capacidade de colocar um sistema completo no ar (backend, frontend e banco), o que impressiona recrutadores.
