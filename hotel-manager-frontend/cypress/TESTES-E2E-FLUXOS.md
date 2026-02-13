# Testes E2E – Todos os fluxos (robô funcional)

Estes testes verificam **todos os fluxos** da aplicação de forma funcional, não apenas pagamento.

## Pré-requisitos

1. **API a correr**: `cd HotelManager.API && dotnet run` (porta 5001)
2. **Frontend a correr**: `cd hotel-manager-frontend && npm start` (porta 4200)
3. **Binário do Cypress**: na primeira vez (ou se aparecer "Cypress executable not found"), execute:
   ```bash
   npm run cypress:install
   ```
   Isto descarrega o executável do Cypress para a pasta de cache (pode demorar 1–2 minutos).

## Como executar os testes

No diretório `hotel-manager-frontend`:

```bash
npm run e2e
```

Ou, se o Cypress estiver no PATH:

```bash
npx cypress run
```

Para abrir a interface gráfica do Cypress (executar testes manualmente):

```bash
npx cypress open
```

## Fluxos cobertos

| Ficheiro | Fluxo | O que é testado |
|----------|--------|-------------------|
| **auth.cy.ts** | Autenticação | Formulário de login, login com hóspede, erro com credenciais inválidas |
| **home.cy.ts** | Home | Página inicial, navegação para Quartos e Login |
| **rooms.cy.ts** | Quartos | Lista de quartos, mensagem quando vazio |
| **flows/01-register.cy.ts** | Cadastro | Formulário em etapas, avançar para etapa 2, link para login |
| **flows/02-reservation-full.cy.ts** | Reserva completa | Login → Quartos → Reservar → Datas → Hóspede → Pagamento (PIX) → Confirmação |
| **flows/03-my-reservations.cy.ts** | Minhas reservas | Redirecionamento sem login, lista/vazia com login, link para quartos |
| **flows/04-simular.cy.ts** | Simulação Quarto+Spa | Navegação lista → detalhe → simular, conteúdo da página de simulação |
| **flows/05-spa-booking.cy.ts** | Agendamento Spa | Lista de pacotes, selecionar pacote, dados, horário, revisão, PIX, confirmação |
| **flows/06-info-pages.cy.ts** | Páginas informativas | Sobre, Contato, Galeria, Políticas, Serviços |
| **flows/07-admin.cy.ts** | Admin | Redirecionamento sem login, acesso com login admin |

## Credenciais usadas nos testes

- **Hóspede**: `hospede@hotel.com` / `Hospede@123`
- **Admin**: `admin@hotel.com` / `Admin@123`

(Devem existir no banco/seed da API.)

## Resultado esperado

Todos os testes devem passar (verde) quando a API e o frontend estão a correr e as credenciais existem.  
Se algum falhar, o Cypress gera **screenshots** em `cypress/screenshots` e **vídeos** em `cypress/videos` para análise.

## Estrutura dos testes

- **Comandos customizados** (`cypress/support/commands.ts`): `loginGuest()`, `loginAdmin()` (login via API e gravação do token no `localStorage`).
- **baseUrl**: `http://localhost:4200` (definido em `cypress.config.ts`).
- Os testes que precisam de login fazem primeiro `cy.visit('/')` e depois `cy.loginGuest()` ou `cy.loginAdmin()` para que o token seja guardado na origem correta.
