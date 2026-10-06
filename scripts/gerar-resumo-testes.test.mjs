import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { taxaAprovacao } from './resumo-calculos.mjs';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'gerar-resumo-testes.mjs');

// Monta um result.json no formato do reporter JSON do Playwright.
// `testes` e um mapa { 'api/arquivo.spec.ts': ['expected', 'unexpected', ...] }.
function montarRelatorio(testes) {
  return {
    stats: { duration: 1000 },
    suites: Object.entries(testes).map(([arquivo, status]) => ({
      title: arquivo,
      file: arquivo,
      line: 0,
      specs: [],
      suites: [
        {
          title: 'Bloco describe',
          file: arquivo,
          line: 3,
          specs: status.map((s, indice) => ({
            title: `teste ${indice + 1}`,
            line: 10 + indice,
            tests: [
              {
                status: s,
                results: [{ status: s === 'unexpected' ? 'failed' : 'passed', error: { message: 'falhou' } }],
              },
            ],
          })),
        },
      ],
    })),
  };
}

function gerarResumo(testes) {
  const pasta = mkdtempSync(path.join(tmpdir(), 'resumo-'));
  try {
    mkdirSync(path.join(pasta, 'test-results'));
    writeFileSync(path.join(pasta, 'test-results', 'result.json'), JSON.stringify(montarRelatorio(testes)));
    const env = { ...process.env };
    delete env.GITHUB_STEP_SUMMARY;
    const execucao = spawnSync(process.execPath, [script], { cwd: pasta, env, encoding: 'utf8' });
    assert.equal(execucao.status, 0, execucao.stderr);
    return execucao.stdout;
  } finally {
    rmSync(pasta, { recursive: true, force: true });
  }
}

const repetir = (status, vezes) => Array(vezes).fill(status);

function taxaGeral(resumo) {
  return resumo.match(/Taxa de aprovação:\*\* (.+)$/m)[1];
}

// Retorna as colunas de uma linha da tabela: [total, aprovados, falharam, instaveis, ignorados, taxa].
function linha(resumo, rotulo) {
  const limpar = (coluna) => coluna.trim().replaceAll('**', '');
  const colunas = resumo
    .split('\n')
    .filter((l) => l.startsWith('|'))
    .map((l) => l.split('|').slice(1, -1).map(limpar))
    .find(([tipo]) => tipo.endsWith(` ${rotulo}`) || tipo === rotulo);
  return colunas.slice(1);
}

function cabecalho(resumo) {
  return resumo.split('\n')[0];
}

describe('taxa de aprovação', () => {
  test('100% quando todos passam', () => {
    assert.equal(taxaGeral(gerarResumo({ 'api/a.spec.ts': repetir('expected', 10) })), '100%');
  });

  test('75% com 3 aprovados e 1 falha', () => {
    const resumo = gerarResumo({ 'api/a.spec.ts': [...repetir('expected', 3), 'unexpected'] });
    assert.equal(taxaGeral(resumo), '75%');
  });

  test('0% quando todos falham', () => {
    assert.equal(taxaGeral(gerarResumo({ 'api/a.spec.ts': repetir('unexpected', 4) })), '0%');
  });

  test('dízima é exibida com uma casa decimal (2 de 3 = 66,6%)', () => {
    const resumo = gerarResumo({ 'api/a.spec.ts': ['expected', 'expected', 'unexpected'] });
    assert.equal(taxaGeral(resumo), '66,6%');
  });

  test('nunca exibe 100% quando existe falha (199 de 200)', () => {
    const resumo = gerarResumo({ 'api/a.spec.ts': [...repetir('expected', 199), 'unexpected'] });
    assert.equal(taxaGeral(resumo), '99,5%');
  });

  test('nunca exibe 100% quando existe falha (1999 de 2000)', () => {
    const resumo = gerarResumo({ 'api/a.spec.ts': [...repetir('expected', 1999), 'unexpected'] });
    assert.equal(taxaGeral(resumo), '99,9%');
  });

  test('nunca exibe 0% quando algum teste passou (1 de 2000)', () => {
    const resumo = gerarResumo({ 'api/a.spec.ts': ['expected', ...repetir('unexpected', 1999)] });
    assert.equal(taxaGeral(resumo), '< 0,1%');
  });

  test('instáveis contam como aprovados, pois passaram na nova tentativa', () => {
    const resumo = gerarResumo({ 'api/a.spec.ts': [...repetir('expected', 3), 'flaky'] });
    assert.equal(taxaGeral(resumo), '100%');
    assert.deepEqual(linha(resumo, 'API'), ['4', '3', '0', '1', '0', '100%']);
  });

  test('ignorados não entram no cálculo da taxa', () => {
    const resumo = gerarResumo({ 'api/a.spec.ts': ['expected', 'expected', 'unexpected', 'skipped', 'skipped'] });
    assert.equal(taxaGeral(resumo), '66,6%');
    assert.deepEqual(linha(resumo, 'API'), ['5', '2', '1', '0', '2', '66,6%']);
  });

  test('sem testes executados a taxa é "—"', () => {
    assert.equal(taxaGeral(gerarResumo({ 'api/a.spec.ts': repetir('skipped', 3) })), '—');
    assert.equal(taxaGeral(gerarResumo({})), '—');
  });
});

describe('taxa de aprovação em todas as combinações (até 150 testes executados)', () => {
  const LIMITE = 150;

  function paraCadaCombinacao(verificar) {
    for (let aprovados = 0; aprovados <= LIMITE; aprovados += 1) {
      for (let falhas = 0; aprovados + falhas <= LIMITE; falhas += 1) {
        if (aprovados + falhas === 0) continue;
        // Instaveis contam como aprovados; alternar entre passed e flaky garante que a soma seja respeitada.
        const instaveis = Math.floor(aprovados / 2);
        const contador = { passed: aprovados - instaveis, failed: falhas, flaky: instaveis, skipped: 3 };
        const exibido = taxaAprovacao(contador);
        verificar({ aprovados, falhas, exibido, exato: (aprovados / (aprovados + falhas)) * 100 });
      }
    }
  }

  const paraNumero = (texto) => Number(texto.replace('%', '').replace(',', '.'));

  test('nunca exibe 100% quando existe falha', () => {
    paraCadaCombinacao(({ falhas, exibido, aprovados }) => {
      if (falhas > 0) assert.notEqual(exibido, '100%', `${aprovados} aprovados / ${falhas} falhas`);
    });
  });

  test('nunca exibe 0% quando algum teste passou', () => {
    paraCadaCombinacao(({ aprovados, falhas, exibido }) => {
      if (aprovados > 0) assert.notEqual(exibido, '0%', `${aprovados} aprovados / ${falhas} falhas`);
    });
  });

  test('o valor exibido nunca é maior que o real e difere dele em menos de 0,1 ponto', () => {
    paraCadaCombinacao(({ aprovados, falhas, exibido, exato }) => {
      if (exibido.startsWith('<')) return;
      const valor = paraNumero(exibido);
      const contexto = `${aprovados} aprovados / ${falhas} falhas: exibido ${exibido}, real ${exato}`;
      assert.ok(valor <= exato + 1e-9, contexto);
      assert.ok(exato - valor < 0.1, contexto);
    });
  });

  test('formato: no máximo uma casa decimal, com vírgula', () => {
    paraCadaCombinacao(({ exibido }) => {
      assert.match(exibido, /^(< 0,1|\d{1,3}(,\d)?)%$/);
    });
  });
});

describe('contagens por camada', () => {
  const resumo = gerarResumo({
    'api/login.api.spec.ts': ['expected', 'expected', 'skipped'],
    'e2e/login.e2e.spec.ts': ['expected', 'unexpected', 'flaky', 'skipped'],
  });

  test('separa API e E2E pelo caminho do arquivo', () => {
    assert.deepEqual(linha(resumo, 'API'), ['3', '2', '0', '0', '1', '100%']);
    assert.deepEqual(linha(resumo, 'E2E'), ['4', '1', '1', '1', '1', '66,6%']);
  });

  test('a linha de total é a soma das camadas', () => {
    assert.deepEqual(linha(resumo, 'Total'), ['7', '3', '1', '1', '2', '80%']);
  });

  test('cada linha soma o próprio total', () => {
    for (const rotulo of ['API', 'E2E', 'Total']) {
      const [total, ...categorias] = linha(resumo, rotulo).slice(0, 5).map(Number);
      assert.equal(categorias.reduce((a, b) => a + b, 0), total, rotulo);
    }
  });

  test('camada sem testes aparece com "—"', () => {
    const somenteE2e = gerarResumo({ 'e2e/a.spec.ts': ['expected'] });
    assert.deepEqual(linha(somenteE2e, 'API'), ['—', '—', '—', '—', '—', '—']);
  });

  test('caminhos do Windows (barra invertida) são reconhecidos', () => {
    const windows = gerarResumo({ 'api\\login.api.spec.ts': ['expected'] });
    assert.deepEqual(linha(windows, 'API'), ['1', '1', '0', '0', '0', '100%']);
  });
});

describe('status geral', () => {
  test('✅ quando todos passam', () => {
    assert.match(cabecalho(gerarResumo({ 'api/a.spec.ts': ['expected'] })), /✅/);
  });

  test('❌ quando existe falha, mesmo com instáveis', () => {
    assert.match(cabecalho(gerarResumo({ 'api/a.spec.ts': ['expected', 'flaky', 'unexpected'] })), /❌/);
  });

  test('⚠️ quando há instáveis e nenhuma falha', () => {
    assert.match(cabecalho(gerarResumo({ 'api/a.spec.ts': ['expected', 'flaky'] })), /⚠️/);
  });

  test('não declara "todos aprovados" quando tudo foi ignorado', () => {
    const resumo = gerarResumo({ 'api/a.spec.ts': repetir('skipped', 3) });
    assert.doesNotMatch(cabecalho(resumo), /✅|aprovados/);
  });
});
