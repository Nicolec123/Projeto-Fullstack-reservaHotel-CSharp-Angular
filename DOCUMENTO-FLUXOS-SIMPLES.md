## Documentação simples do aplicativo Hotel Manager

Este documento explica, em linguagem simples, **o que o app faz** e **quais são os principais fluxos de uso** já implementados.

---

## 1. O que é o app

O **Hotel Manager** é um sistema de reservas de hotel.

Com ele é possível:

- **Hóspedes**: criar conta, fazer login, ver quartos, fazer reservas, ver e cancelar reservas, simular valores e agendar spa.
- **Equipe do hotel** (admin, gerente, recepcionista): entrar em um painel administrativo, ver todas as reservas, cadastrar e editar quartos e visualizar usuários.

O app é dividido em:

- **Frontend**: site em Angular que o usuário acessa pelo navegador.
- **Backend**: API em ASP.NET que contém as regras de negócio e conversa com o banco de dados.

---

## 2. Perfis de usuário

- **Hóspede (User)**  
  - Cria conta e faz login.  
  - Vê lista de quartos e detalhes.  
  - Faz reservas completas com pagamento.  
  - Vê página de **Minhas reservas**.  
  - Pode cancelar suas próprias reservas (respeitando regras).  
  - Pode simular reserva combinando quarto e spa.  
  - Pode agendar serviços de spa.

- **Administrador (Admin)**  
  - Faz login na área administrativa.  
  - Cria colaboradores (Gerente, Recepcionista).  
  - Vê todas as reservas.  
  - Cria e atualiza quartos.  
  - Lista e gerencia usuários.

- **Gerente**  
  - Faz login na área administrativa.  
  - Vê todas as reservas.  
  - Cria e atualiza quartos.  
  - Lista usuários.

- **Recepcionista**  
  - Faz login na área administrativa.  
  - Vê todas as reservas.  
  - Atualiza quartos.  
  - Lista usuários.

---

## 3. Áreas principais do app

### 3.1 Área pública (sem login)

Nesta área qualquer visitante pode navegar:

- **Home**: página inicial com destaque dos serviços do hotel.  
- **Lista de quartos** (`/quartos`): mostra os quartos disponíveis, com informações básicas e botões para ver detalhes.  
- **Detalhes do quarto** (`/quartos/:id`): mostra informações completas de um quarto específico.  
- **Simulação de reserva** (`/quartos/:id/simular`): permite simular o valor de uma hospedagem, com possibilidade de combinar com spa.  
- **Agendamento de spa** (`/spa/agendar`): fluxo para escolher pacote de spa, preencher dados e confirmar o agendamento.  
- **Páginas informativas**: sobre, serviços, galeria, contato, políticas.

Também aqui estão as telas de:

- **Login** (`/login`)  
- **Cadastro** (`/cadastro`)

### 3.2 Área autenticada do hóspede

Depois de fazer login como hóspede, o usuário tem acesso a:

- **Reservar quarto** (`/reservar/:id`): fluxo em etapas para concluir uma reserva.  
- **Minhas reservas** (`/minhas-reservas`): lista de reservas daquele hóspede, com detalhes e ações como cancelar (quando permitido).

### 3.3 Área administrativa

Depois de fazer login como Admin, Gerente ou Recepcionista:

- **Painel Admin** (`/admin`):  
  - visão geral do sistema,  
  - lista de todas as reservas,  
  - gerenciamento de quartos (criar, editar, bloquear),  
  - listagem de usuários (dependendo do perfil).

---

## 4. Fluxos principais do app

### 4.1 Fluxo de Login

**Objetivo:** permitir que usuário entre no sistema.

Passos gerais do hóspede:

1. Acessa a página de **Login**.  
2. Informa email e senha.  
3. Clica em entrar.  
4. O sistema valida os dados com a API.  
5. Se estiver tudo correto, o usuário é autenticado e redirecionado para a área desejada.  
6. Se houver erro (senha ou email incorretos), o sistema mostra uma mensagem de erro.

Há também um login específico para administradores e equipe do hotel.

---

### 4.2 Fluxo de Cadastro de novo hóspede

**Objetivo:** criar uma nova conta de hóspede.

Passos:

1. Usuário acessa a página de **Cadastro**.  
2. Preenche os dados básicos: nome, email, senha e confirmação de senha.  
3. Avança para a próxima etapa com dados pessoais (documento e outros).  
4. Confirma o cadastro.  
5. O sistema envia as informações para a API, que cria o usuário no banco de dados.  
6. A partir daí, esse usuário já pode fazer login.

---

### 4.3 Fluxo de Reserva completa de quarto

**Objetivo:** permitir que um hóspede faça uma reserva real, com datas e pagamento.

Passos:

1. Hóspede faz login.  
2. Acessa a **lista de quartos**.  
3. Escolhe um quarto e entra na tela de **detalhes do quarto**.  
4. Clica em **Reservar** e é levado para a tela de reserva daquele quarto.  
5. Na etapa de **Datas**, escolhe data de entrada e data de saída.  
6. Na etapa de **Dados do hóspede**, confirma ou preenche dados complementares (por exemplo telefone).  
7. Na etapa de **Revisão e pagamento**, vê o resumo da reserva (quarto, datas, valor total) e escolhe o método de pagamento (por exemplo PIX, cartão ou boleto).  
8. Clica em **Confirmar e finalizar**.  
9. O sistema envia os dados para a API, que valida disponibilidade, calcula o valor, registra o pagamento (simulado) e cria a reserva.  
10. A tela mostra uma **confirmação de reserva**.

Regras importantes nesse fluxo:

- Não pode existir outra reserva que use o mesmo quarto no mesmo período.  
- O próprio usuário não pode ter duas reservas com datas que se sobrepõem.  
- Datas precisam ser futuras e com início antes do fim.  
- O valor considera diárias, crianças e pets, conforme regras de negócio.

---

### 4.4 Fluxo “Minhas reservas”

**Objetivo:** permitir que o hóspede acompanhe o que já reservou.

Passos:

1. Usuário acessa **Minhas reservas**.  
2. Se não estiver logado, o sistema envia para a tela de login.  
3. Depois de logado, volta para **Minhas reservas**.  
4. A tela mostra uma lista com as reservas daquele usuário ou uma mensagem caso não haja nenhuma.  
5. Em cada item é possível ver informações como quarto, datas, valor e status.  
6. Quando permitido pelas regras de negócio, o usuário pode **cancelar** uma reserva.

---

### 4.5 Fluxo de Simulação de reserva (quarto + spa)

**Objetivo:** permitir que um visitante simule o valor da hospedagem, com opção de adicionar spa.

Passos:

1. Usuário acessa a **lista de quartos** e escolhe um quarto.  
2. Na tela de **detalhes do quarto**, clica em **Simular**.  
3. A tela de simulação mostra os dados do quarto e campos para informar datas e outras opções (adultos, crianças, pets).  
4. O usuário pode escolher um **pacote de spa** para combinar com a hospedagem.  
5. O sistema calcula e mostra o **valor estimado**.  
6. A partir dessa tela, o usuário pode apenas visualizar a simulação ou decidir seguir para o fluxo de **reserva completa**.

Este fluxo é aberto, não exige login, e serve para o usuário entender os valores antes de se comprometer.

---

### 4.6 Fluxo de Agendamento de spa

**Objetivo:** permitir que o usuário marque um serviço de spa.

Passos:

1. Usuário acessa a rota de **Agendar spa**.  
2. Vê uma lista de pacotes de spa disponíveis.  
3. Escolhe um pacote clicando em seu cartão.  
4. Vai para a etapa de **Dados do agendamento**, onde informa data, horário, nome, email e telefone.  
5. Clica em continuar e vê uma tela de **Revisão do agendamento**, com o resumo.  
6. Escolhe o método de pagamento (por exemplo PIX).  
7. Clica em **Confirmar agendamento**.  
8. O sistema registra o agendamento e mostra uma mensagem de confirmação.

---

### 4.7 Fluxo de navegação em páginas informativas

**Objetivo:** apresentar o hotel e suas políticas para qualquer visitante.

Passos gerais:

1. Usuário escolhe, no menu ou na home, uma das páginas informativas (sobre, serviços, galeria, contato, políticas).  
2. A tela mostra o conteúdo estático daquela página.  
3. O usuário pode voltar para a home ou navegar para outras seções pelo menu.

---

### 4.8 Fluxo de Painel administrativo

**Objetivo:** permitir que a equipe do hotel gerencie o sistema.

Passos:

1. Usuário acessa a rota do **Painel Admin**.  
2. Se não estiver logado, é redirecionado para o **Login**.  
3. Faz login com uma conta de Admin, Gerente ou Recepcionista.  
4. Acessa o painel, onde vê:  
   - visão geral do sistema,  
   - lista de todas as reservas,  
   - telas para cadastrar e atualizar quartos,  
   - telas para listar usuários (de acordo com o perfil).  
5. Se um hóspede comum tentar acessar o painel, o sistema não permite e redireciona para uma área apropriada (como lista de quartos).

---

## 5. Resumo final

- O app **Hotel Manager** é um sistema completo para reservas de hotel.  
- Hóspedes conseguem se cadastrar, entrar, ver quartos, simular, reservar, pagar, ver e cancelar reservas.  
- A equipe do hotel consegue entrar em um painel administrativo, gerenciar quartos e acompanhar todas as reservas.  
- Existem fluxos específicos para **login**, **cadastro**, **reserva completa**, **minhas reservas**, **simulação de reserva**, **agendamento de spa**, páginas informativas e **painel administrativo**.

Este documento foi pensado para explicar o sistema de forma direta, sem termos muito técnicos e sem imagens, focado apenas nos fluxos e na experiência do usuário.

