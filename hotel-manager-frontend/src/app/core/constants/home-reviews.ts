/**
 * Avaliações gerais do hotel para a home (carrossel)
 */
export interface HomeReview {
  nome: string;
  data: string;
  nota: number;
  texto: string;
  avatarUrl: string;
}

function avatarUrl(nome: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&size=96&background=A67B5B&color=fff`;
}

export const HOME_REVIEWS: HomeReview[] = [
  {
    nome: 'Ana Paula Costa',
    data: 'Jan 2024',
    nota: 5,
    texto: 'Ficamos muito satisfeitos! Quarto limpo, cama confortável e atendimento excelente. O spa é um diferencial incrível.',
    avatarUrl: avatarUrl('Ana Paula Costa')
  },
  {
    nome: 'Carlos Eduardo',
    data: 'Fev 2024',
    nota: 5,
    texto: 'Hotel & Spa Vista Serena superou as expectativas. Café da manhã delicioso e a massagem no spa foi relaxante demais.',
    avatarUrl: avatarUrl('Carlos Eduardo')
  },
  {
    nome: 'Marina Oliveira',
    data: 'Fev 2024',
    nota: 5,
    texto: 'Experiência ótima! Combinamos hospedagem com um dia de spa. Equipe atenciosa e ambiente muito aconchegante.',
    avatarUrl: avatarUrl('Marina Oliveira')
  },
  {
    nome: 'Roberto Santos',
    data: 'Jan 2024',
    nota: 5,
    texto: 'Relação custo-benefício excelente. O pacote hotel + spa vale cada centavo. Super indico!',
    avatarUrl: avatarUrl('Roberto Santos')
  },
  {
    nome: 'Patricia Rocha',
    data: 'Fev 2024',
    nota: 5,
    texto: 'Fomos para lua de mel e foi perfeito! Spa romântico, quarto impecável. Experiência inesquecível.',
    avatarUrl: avatarUrl('Patricia Rocha')
  },
  {
    nome: 'Henrique Gomes',
    data: 'Fev 2024',
    nota: 5,
    texto: 'Melhor hotel que já fiquei! Spa de primeira, piscina linda. O hotel pensou em cada detalhe. Nota 10!',
    avatarUrl: avatarUrl('Henrique Gomes')
  }
];
