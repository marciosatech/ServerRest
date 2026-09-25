import { appendFileSync, existsSync, readFileSync } from 'node:fs';

const caminhoResultado = 'test-results/result.json';
const caminhoResumo = process.env.GITHUB_STEP_SUMMARY;

if (!caminhoResumo) {
  console.log('GITHUB_STEP_SUMMARY nao esta definido; resumo ignorado.');
  process.exit(0);
}

if (!existsSync(caminhoResultado)) {
  appendFileSync(caminhoResumo, '## Resultado dos testes\n\nO arquivo de resultados nao foi gerado.\n');
  process.exit(0);
}

const relatorio = JSON.parse(readFileSync(caminhoResultado, 'utf8'));
const totais = {
  passed: 0,
  failed: 0,
  skipped: 0,
  flaky: 0,
};
const porTipo = {
  api: { passed: 0, failed: 0, skipped: 0, flaky: 0 },
  e2e: { passed: 0, failed: 0, skipped: 0, flaky: 0 },
};

function registrar(status, arquivo) {
  const normalizado = arquivo.replaceAll('\\', '/');
  const tipo = normalizado.startsWith('api/') || normalizado.includes('/api/') ? 'api' : 'e2e';
  const categoria = status === 'expected' ? 'passed' : status === 'unexpected' ? 'failed' : status;

  if (!(categoria in totais)) return;

  totais[categoria] += 1;
  porTipo[tipo][categoria] += 1;
}

function visitarSuite(suite) {
  for (const spec of suite.specs ?? []) {
    for (const teste of spec.tests ?? []) {
      registrar(teste.status, suite.file ?? spec.file ?? '');
    }
  }

  for (const filha of suite.suites ?? []) {
    visitarSuite(filha);
  }
}

for (const suite of relatorio.suites ?? []) {
  visitarSuite(suite);
}

const total = Object.values(totais).reduce((soma, valor) => soma + valor, 0);
const linhas = [
  '## Resultado dos testes',
  '',
  `**Total:** ${total} | **Aprovados:** ${totais.passed} | **Falharam:** ${totais.failed} | **Ignorados:** ${totais.skipped} | **Instaveis:** ${totais.flaky}`,
  '',
  '| Tipo | Aprovados | Falharam | Ignorados | Instaveis |',
  '| --- | ---: | ---: | ---: | ---: |',
  `| API | ${porTipo.api.passed} | ${porTipo.api.failed} | ${porTipo.api.skipped} | ${porTipo.api.flaky} |`,
  `| E2E | ${porTipo.e2e.passed} | ${porTipo.e2e.failed} | ${porTipo.e2e.skipped} | ${porTipo.e2e.flaky} |`,
  '',
  'O relatorio HTML, traces, videos e screenshots estao disponiveis nos artefatos desta execucao.',
  '',
];

appendFileSync(caminhoResumo, `${linhas.join('\n')}\n`);
