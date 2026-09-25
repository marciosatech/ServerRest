# Serverest - Automação de testes

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Modern-45ba4a)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)](https://www.typescriptlang.org/)

Este projeto foi desenvolvido para automatizar testes da aplicação Serverest, cobrindo tanto a camada de API quanto a camada de interface do usuário. A suíte foi estruturada para permitir validações rápidas, confiáveis e fáceis de manter.

O objetivo principal é garantir que fluxos críticos da aplicação continuem funcionais, como login, validação de campos, autenticação e navegação após autenticação.

---

## Visão geral do projeto

A automação está organizada em camadas e cada uma tem uma responsabilidade clara:

- Testes de API: validam regras de backend, endpoints e respostas.
- Testes E2E: simulam a experiência real do usuário no navegador.
- Page Objects: centralizam interações com elementos da página.
- Fixtures: montam o contexto que o teste precisa para rodar.
- Dados: armazenam massa de testes em arquivos JSON.
- Support: auxilia com relatórios, screenshots e evidências.

Essa estrutura evita que tudo fique “misturado” em um único arquivo e melhora a manutenção da suíte ao longo do tempo.

---

## Por que o projeto é organizado assim?

Em automação de testes, um código bem estruturado facilita:

- leitura do cenário
- manutenção do fluxo
- correção de falhas
- reutilização de ações e validações
- crescimento da suíte sem perder qualidade

A regra geral é simples:

- cenário descreve o comportamento esperado
- página implementa a interação com a interface
- dados carregam os valores de entrada
- fixture prepara o contexto
- suporte gera evidências

---

## Tecnologias utilizadas

- Node.js
- TypeScript
- Playwright
- JSON
- Page Object Model (POM)
- Fixtures do Playwright

---

## Estrutura do repositório

```text
.
├── README.md
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── scripts/
│   └── gerar-resumo-testes.mjs
├── playwright-report/
│   └── relatórios HTML gerados pelo Playwright
├── test-results/
│   ├── result.json
│   └── arquivos de execução (screenshot, vídeo, trace, contexto)
├── tests/
│   ├── README.md
│   ├── api/
│   │   ├── clients/
│   │   │   └── AuthenticationApi.ts
│   │   ├── fixtures/
│   │   │   └── api.fixture.ts
│   │   └── login.api.spec.ts
│   ├── data/
│   │   └── login.data.json
│   ├── e2e/
│   │   ├── fixtures/
│   │   │   └── login.fixture.ts
│   │   ├── pages/
│   │   │   ├── HomePage.ts
│   │   │   └── LoginPage.ts
│   │   └── login.e2e.spec.ts
│   └── support/
│       └── capture-evidence.ts
└── .gitignore
```

---

## Responsabilidade de cada pasta

### `package.json`
Arquivo central do projeto.

Ele define:

- scripts de execução
- dependências do projeto
- comandos úteis para desenvolvimento e validação

Scripts principais:

```bash
npm test
npm run test:api
npm run test:e2e
npm run test:login
npm run test:headed
npm run verificar:tipos
npm run gerar:resumo
```

---

### `playwright.config.ts`
Arquivo de configuração global do Playwright.

Ele controla:

- diretório de testes
- baseURL da aplicação
- timeout padrão
- report generation
- browser e comportamento da execução
- screenshots, vídeos e traces

Configuração relevante:

```ts
baseURL: 'https://front.serverest.dev'
```

Isso torna mais simples abrir a aplicação sem repetir a URL em cada cenário.

---

### `scripts/`
Pasta com utilitários auxiliares, como geração de resumo ou dados extra para automação.

---

### `playwright-report/`
Contém os relatórios HTML gerados pelo Playwright, muito úteis para revisão visual de falhas e compartilhamento com a equipe.

---

### `test-results/`
Pasta que guarda artefatos de execução.

Inclui:

- JSON de resultado
- screenshots de falha
- vídeos de execução
- trace do teste
- contexto de erro

Ele é essencial para análise de falhas.

---

### `tests/`
Pasta principal da suíte. Aqui ficam os testes e os arquivos que os sustentam.

---

## Camada de API

A pasta `tests/api` concentra cenários de backend.

### `tests/api/login.api.spec.ts`
Arquivo do cenário de API de login.

Ele geralmente:

- envia uma requisição HTTP
- valida código de resposta
- verifica payload de retorno
- valida mensagens de sucesso ou erro

### `tests/api/clients/`
Arquivos aqui encapsulam a comunicação com endpoints da API.

Exemplo:

- `AuthenticationApi.ts`

Esses clientes centralizam a lógica de chamada HTTP e evitar repetição nos cenários.

### `tests/api/fixtures/`
Pasta para fixtures específicas de API, como preparação de payloads, headers e contexto do teste.

---

## Camada E2E

A pasta `tests/e2e` reúne os testes de interface.

### `tests/e2e/login.e2e.spec.ts`
É o cenário principal de login em navegador.

Ele descreve o fluxo do usuário, por exemplo:

- abrir a página de login
- preencher credenciais
- enviar formulário
- validar mensagem de erro ou sucesso
- confirmar navegação para a home

Esse arquivo é o que contém a história do cenário em nível de negócio.

### `tests/e2e/pages/`
Aqui ficam os Page Objects.

#### `LoginPage.ts`
Responsável por abstrair ações da tela de login, como:

- abrir página
- preencher e-mail
- preencher senha
- clicar no botão
- validar mensagem de obrigatoriedade
- validar erro de credenciais inválidas

#### `HomePage.ts`
Representa a página inicial após login.

Validações típicas:

- URL da página inicial
- visibilidade de elementos
- navegação após autenticação
- conteúdo principal da home

Page Objects ajudam a separar a lógica do teste da lógica da página.

### `tests/e2e/fixtures/`
Prepara o contexto do teste.

Exemplo do projeto:

```ts
export const test = base.extend<FixturesLogin>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dadosLogin: async ({}, use) => {
    await use({
      credenciaisInvalidas: dadosLogin.credenciaisInvalidas,
      credenciaisValidas: {
        email: process.env.LOGIN_EMAIL ?? '',
        password: process.env.LOGIN_PASSWORD ?? '',
      },
    });
  },
});
```

Esse padrão reduz duplicação e deixa o cenário limpo.

---

## Dados de teste

A pasta `tests/data` guarda massa estática em arquivos JSON.

### `login.data.json`
Exemplo:

```json
{
  "credenciaisInvalidas": {
    "email": "login-invalido@example.com",
    "password": "SenhaInvalida123!"
  }
}
```

Esse tipo de dado é usado em cenários que não dependem de login real, como teste de erro e validação de mensagens.

---

## Suporte e evidência

A pasta `tests/support` agrupa utilitários compartilhados.

### `capture-evidence.ts`
Arquivo responsável por registrar evidências, como:

- screenshot
- vídeo
- trace
- contexto da falha

Ele ajuda a diagnosticar problemas com muito mais clareza.

---

## Fluxo de um teste do começo ao fim

Um cenário automatizado normalmente segue esse fluxo:

1. O Playwright lê a configuração global.
2. Encontra os testes na pasta `tests`.
3. Carrega fixtures e dependências do cenário.
4. O teste recebe as páginas e os dados necessários.
5. O código executa interações na aplicação.
6. Asserções validam o comportamento esperado.
7. Em caso de falha, evidência é salva.
8. O relatório final é gerado.

Exemplo simples:

```ts
await loginPage.abrir();
await loginPage.entrarComCredenciais(email, senha);
await homePage.validarPaginaExibida();
```

Esse padrão é muito comum em testes E2E com Page Objects.

---

## Credenciais válidas e variáveis de ambiente

Para executar o cenário de login válido, o projeto lê dados a partir de variáveis de ambiente.

No fixture:

```ts
credenciaisValidas: {
  email: process.env.LOGIN_EMAIL ?? '',
  password: process.env.LOGIN_PASSWORD ?? '',
}
```

As variáveis esperadas são:

- `LOGIN_EMAIL`
- `LOGIN_PASSWORD`

Se qualquer uma estiver vazia, o cenário é ignorado para evitar falha por ausência de configuração.

### Windows PowerShell

```powershell
$env:LOGIN_EMAIL="seu_email@exemplo.com"
$env:LOGIN_PASSWORD="SuaSenha123!"
npx playwright test tests/e2e/login.e2e.spec.ts --grep "credenciais válidas"
```

### Linux/macOS

```bash
export LOGIN_EMAIL="seu_email@exemplo.com"
export LOGIN_PASSWORD="SuaSenha123!"
npx playwright test tests/e2e/login.e2e.spec.ts --grep "credenciais válidas"
```

> O valor usado deve ser válido para o ambiente em que a aplicação está sendo testada.

---

## Por que o teste usa `test.skip`?

No cenário de login válido, existe esta proteção:

```ts
test.skip(
  !dadosLogin.credenciaisValidas.email || !dadosLogin.credenciaisValidas.password,
  'Defina LOGIN_EMAIL e LOGIN_PASSWORD para executar o login válido.',
);
```

Esse comando indica:

- se as credenciais não estiverem configuradas, o teste não roda
- a suíte continua estável
- o motivo da omissão fica visível no relatório

Isso é útil porque o cenário depende de credenciais reais e não deve falhar por ausência de ambiente configurado.

---

## Como rodar a automação

### 1. Instalar dependências

```bash
npm install
```

### 2. Instalar browsers do Playwright

```bash
npx playwright install
```

### 3. Executar toda a suíte

```bash
npm test
```

### 4. Rodar somente API

```bash
npm run test:api
```

### 5. Rodar somente E2E

```bash
npm run test:e2e
```

### 6. Rodar apenas o cenário de login

```bash
npm run test:login
```

### 7. Rodar em modo visual

```bash
npm run test:headed
```

### 8. Validar tipos TypeScript

```bash
npm run verificar:tipos
```

### 9. Gerar resumo auxiliar

```bash
npm run gerar:resumo
```

---

## Relatórios e evidência

O Playwright já vem com suporte a relatórios e artefatos de execução.

### Tipos de relatório

- console
- HTML
- JSON
- screenshots
- vídeos
- trace

Para abrir o relatório HTML:

```bash
npx playwright show-report
```

Essas evidências são muito importantes para entender falhas e analisar regressões rapidamente.

---

## Boas práticas do projeto

Para manter a automação organizada e estável, vale seguir estas regras:

- separar cenário, dados e ações
- manter Page Objects focados em interface
- evitar hardcoded de dados sensíveis no código
- usar fixtures para montar contexto
- reutilizar ações comuns em vez de duplicar código
- validar resultados claros e objetivos
- capturar evidência em falhas
- manter nomes de testes legíveis e sem ambiguidade

---

## Como criar um novo teste

Um novo cenário normalmente segue este fluxo:

1. decidir se é API ou E2E
2. criar o arquivo em `tests/api` ou `tests/e2e`
3. reutilizar Page Objects ou clients existentes
4. adicionar dados em `tests/data` quando necessário
5. executar o cenário isolado
6. validar falhas e corrigir conforme necessário

---

## Troubleshooting

### Teste aparece como `skipped`
Normalmente significa que a condição de execução não foi satisfeita, como ausência de credenciais ou requisito de ambiente.

### Falha na URL esperada
Pode indicar que o login ou redirecionamento não ocorreu como esperado.

### Elemento não encontrado
Pode haver:

- seletor inválido
- tela ainda carregando
- problema de sincronização
- mudança na UI

### Falha por ambiente
Verifique se:

- as variáveis de ambiente foram exportadas
- a aplicação está acessível
- o estado esperado do sistema está configurado

---

## Convenções adotadas

- cenários de API ficam em `tests/api`
- cenários E2E ficam em `tests/e2e`
- dados fixos ficam em `tests/data`
- interações da UI ficam em page objects
- contextos e dependências ficam em fixtures
- evidências ficam em `test-results/`
- configuração global fica em `playwright.config.ts`

---

## Resumo rápido

Se você quiser entender o projeto de forma prática, pense assim:

- `package.json` = comandos e scripts
- `playwright.config.ts` = configuração do Playwright
- `tests/e2e/*.spec.ts` = cenários de comportamento
- `tests/e2e/pages/*.ts` = ações da tela
- `tests/e2e/fixtures/*.ts` = contexto do teste
- `tests/data/*.json` = massa fixa
- `tests/support/*.ts` = ferramentas auxiliares
- `tests/api/*` = testes de backend

Essa organização é a base da automação elegante e sustentável.

---

## Conclusão

Este projeto está estruturado para ser fácil de seguir, expandir e manter. A separação correta entre cenário, dados, páginas, fixtures, suporte e configuração faz com que a automação seja mais legível e menos vulnerável a falhas por falta de organização.

A principal ideia é simples: cada arquivo tem uma tarefa, e cada tarefa tem um lugar certo.

Com essa base, a suíte pode crescer sem perder clareza, qualidade e facilidade de manutenção.
