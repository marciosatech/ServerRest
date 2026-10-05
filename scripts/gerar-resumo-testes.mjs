import { appendFileSync, existsSync, readFileSync } from 'node:fs';

const caminhoResultado = 'test-results/result.json';
const caminhoResumo = process.env.GITHUB_STEP_SUMMARY;
const LIMITE_ERRO = 1500;

// Sem GITHUB_STEP_SUMMARY (execucao local), o resumo e impresso no terminal para pre-visualizacao.
function publicar(conteudo) {
  if (caminhoResumo) {
    appendFileSync(caminhoResumo, `${conteudo}\n`);
  } else {
    console.log(conteudo);
  }
}

if (!existsSync(caminhoResultado)) {
  publicar('## ⚠️ Resultado dos testes\n\n> [!WARNING]\n> O arquivo de resultados não foi gerado. Verifique os logs da etapa de execução.\n');
  process.exit(0);
}

const relatorio = JSON.parse(readFileSync(caminhoResultado, 'utf8'));
const categorias = ['passed', 'failed', 'flaky', 'skipped'];
const novoContador = () => Object.fromEntries(categorias.map((categoria) => [categoria, 0]));
const totais = novoContador();
const porTipo = { api: novoContador(), e2e: novoContador() };
const falhas = [];
const instaveis = [];

function removerCoresAnsi(texto) {
  return texto.replace(/\u001b\[[0-9;]*m/g, '');
}

function registrar(teste, spec, titulos, arquivo) {
  const normalizado = arquivo.replaceAll('\\', '/');
  const tipo = normalizado.startsWith('api/') || normalizado.includes('/api/') ? 'api' : 'e2e';
  const status = teste.status;
  const categoria = status === 'expected' ? 'passed' : status === 'unexpected' ? 'failed' : status;

  if (!(categoria in totais)) return;

  totais[categoria] += 1;
  porTipo[tipo][categoria] += 1;

  const detalhe = {
    tipo,
    titulo: [...titulos, spec.title].join(' › '),
    local: `${normalizado}:${spec.line}`,
    tentativas: teste.results?.length ?? 0,
  };

  if (categoria === 'failed') {
    const ultimoResultado = teste.results?.at(-1);
    const mensagem = removerCoresAnsi(ultimoResultado?.error?.message ?? 'Sem mensagem de erro.').trim();
    detalhe.erro = mensagem.length > LIMITE_ERRO ? `${mensagem.slice(0, LIMITE_ERRO)}\n…` : mensagem;
    falhas.push(detalhe);
  } else if (categoria === 'flaky') {
    instaveis.push(detalhe);
  }
}

function visitarSuite(suite, titulos = []) {
  // A suite raiz representa o arquivo; apenas os blocos describe entram no titulo.
  const proximosTitulos = suite.line ? [...titulos, suite.title] : titulos;

  for (const spec of suite.specs ?? []) {
    for (const teste of spec.tests ?? []) {
      registrar(teste, spec, proximosTitulos, suite.file ?? spec.file ?? '');
    }
  }

  for (const filha of suite.suites ?? []) {
    visitarSuite(filha, proximosTitulos);
  }
}

for (const suite of relatorio.suites ?? []) {
  visitarSuite(suite);
}

function somar(contador) {
  return Object.values(contador).reduce((soma, valor) => soma + valor, 0);
}

function taxaAprovacao(contador) {
  const executados = contador.passed + contador.failed + contador.flaky;
  if (executados === 0) return '—';
  return `${Math.round(((contador.passed + contador.flaky) / executados) * 100)}%`;
}

function iconeStatus(contador) {
  if (somar(contador) === 0) return '➖';
  if (contador.failed > 0) return '❌';
  if (contador.flaky > 0) return '⚠️';
  return '✅';
}

function formatarDuracao(milissegundos = 0) {
  const segundos = Math.round(milissegundos / 1000);
  const minutos = Math.floor(segundos / 60);
  return minutos > 0 ? `${minutos}min ${segundos % 60}s` : `${segundos}s`;
}

function linhaTabela(rotulo, contador) {
  const valores = somar(contador) === 0
    ? ['—', '—', '—', '—', '—', '—']
    : [somar(contador), contador.passed, contador.failed, contador.flaky, contador.skipped, taxaAprovacao(contador)];
  return `| ${iconeStatus(contador)} ${rotulo} | ${valores.join(' | ')} |`;
}

const total = somar(totais);
const titulosPorStatus = {
  '❌': 'Falha na execução',
  '⚠️': 'Aprovado com testes instáveis',
  '✅': 'Todos os testes aprovados',
  '➖': 'Nenhum teste executado',
};
const statusGeral = iconeStatus(totais);
const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
const linkArtefatos = GITHUB_REPOSITORY && GITHUB_RUN_ID
  ? `[artefatos desta execução](${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}#artifacts)`
  : 'artefatos desta execução';

const linhas = [
  `## ${statusGeral} Resultado dos testes — ${titulosPorStatus[statusGeral]}`,
  '',
  `⏱️ **Duração:** ${formatarDuracao(relatorio.stats?.duration)} · 🧪 **Total:** ${total} · 📈 **Taxa de aprovação:** ${taxaAprovacao(totais)}`,
  '',
  '| Tipo | Total | ✅ Aprovados | ❌ Falharam | ⚠️ Instáveis | ⏭️ Ignorados | Taxa |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  linhaTabela('API', porTipo.api),
  linhaTabela('E2E', porTipo.e2e),
  `| **Total** | **${total}** | **${totais.passed}** | **${totais.failed}** | **${totais.flaky}** | **${totais.skipped}** | **${taxaAprovacao(totais)}** |`,
  '',
];

if (falhas.length > 0) {
  linhas.push(`### ❌ Testes com falha (${falhas.length})`, '');
  for (const falha of falhas) {
    linhas.push(
      '<details>',
      `<summary><b>[${falha.tipo.toUpperCase()}]</b> ${falha.titulo}</summary>`,
      '',
      `📄 \`${falha.local}\` · 🔁 ${falha.tentativas} tentativa(s)`,
      '',
      '```text',
      falha.erro,
      '```',
      '',
      '</details>',
      '',
    );
  }
}

if (instaveis.length > 0) {
  linhas.push(
    `### ⚠️ Testes instáveis (${instaveis.length})`,
    '',
    'Passaram somente após nova tentativa — vale investigar.',
    '',
    ...instaveis.map((teste) => `- **[${teste.tipo.toUpperCase()}]** ${teste.titulo} — \`${teste.local}\` (${teste.tentativas} tentativas)`),
    '',
  );
}

linhas.push(
  '---',
  '',
  `📦 Relatório HTML, traces, vídeos e screenshots estão disponíveis nos ${linkArtefatos}.`,
  '',
);

publicar(linhas.join('\n'));
