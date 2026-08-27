export function formatFCFA(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1).replace('.0', '')}M FCFA`
  if (amount >= 1000) return `${Math.round(amount / 1000)}k FCFA`
  return `${amount} FCFA`
}

export function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR')
}
