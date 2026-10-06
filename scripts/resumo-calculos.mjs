// Calculos do resumo de testes, separados para poderem ser testados isoladamente.
// `contador` tem o formato { passed, failed, flaky, skipped }.

export function somar(contador) {
  return Object.values(contador).reduce((soma, valor) => soma + valor, 0);
}

// Instaveis contam como aprovados (passaram na nova tentativa); ignorados ficam fora do calculo.
export function taxaAprovacao(contador) {
  const executados = contador.passed + contador.failed + contador.flaky;
  if (executados === 0) return '—';

  const aprovados = contador.passed + contador.flaky;
  // Trunca em vez de arredondar, para nunca exibir 100% com falhas. A conta e feita em
  // inteiros para evitar erro de ponto flutuante (ex.: 199 / 200 * 1000 = 994.999...).
  const percentual = Math.floor((aprovados * 1000) / executados) / 10;
  if (percentual === 0 && aprovados > 0) return '< 0,1%';
  return `${percentual.toLocaleString('pt-BR')}%`;
}

export function iconeStatus(contador) {
  if (somar(contador) === 0) return '➖';
  if (contador.failed > 0) return '❌';
  if (contador.flaky > 0) return '⚠️';
  if (contador.passed === 0) return '⏭️';
  return '✅';
}
