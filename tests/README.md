# Estrutura de testes

A pasta `tests` separa os testes pelo tipo e pela responsabilidade de cada arquivo.

```text
tests/
├── api/
│   ├── clients/        # Clientes HTTP reutilizáveis
│   ├── fixtures/       # Fixtures exclusivas dos testes de API
│   └── *.api.spec.ts   # Cenários de contrato da API
├── e2e/
│   ├── fixtures/       # Fixtures dos testes pelo navegador
│   ├── pages/           # Page Objects da interface
│   └── *.e2e.spec.ts   # Cenários completos do usuário
├── data/               # Massa estática compartilhada, em JSON
└── support/            # Utilitários compartilhados entre testes
```

## Comandos

```bash
npm run test:api       # Executa somente os testes de API
npm run test:e2e       # Executa todos os testes E2E
npm run test:login     # Executa somente o E2E de login
npm test               # Executa toda a suíte
npm run verificar:tipos
```

No GitHub Actions, o workflow manual permite escolher `api`, `e2e` ou `todos`.

## Convenções

- Testes de API ficam em `api/` e não abrem navegador.
- Testes E2E ficam em `e2e/` e usam Page Objects.
- Dados de teste ficam em `data/`.
- Fixtures montam dependências para os testes.
- Clientes de API não devem ser usados como Page Objects.
- Page Objects não devem conter regras de negócio da API.
