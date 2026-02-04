/**
 * Os 3 pilares do spa - inspirado em hotéis de luxo
 */
export interface SpaPillar {
  id: string;
  nome: string;
  descricao: string;
  tratamentos: string[];
  cor: string;
  icone: string;
}

export const SPA_PILLARS: SpaPillar[] = [
  {
    id: 'detox',
    nome: 'Detox',
    descricao: 'Tratamentos desintoxicantes para purificar corpo e mente',
    tratamentos: [
      'Drenagem linfática',
      'Esfoliação corporal',
      'Banho de argila',
      'Tratamento desintoxicante'
    ],
    cor: '#2D6A4F',
    icone: '🌿'
  },
  {
    id: 'relaxando',
    nome: 'Relaxando',
    descricao: 'Experiências relaxantes para acalmar corpo e mente',
    tratamentos: [
      'Massagem relaxante',
      'Shiatsu',
      'Reflexologia',
      'Massagem aromática',
      'Tratamento facial'
    ],
    cor: '#A67B5B',
    icone: '🧘'
  },
  {
    id: 'energizando',
    nome: 'Energizando',
    descricao: 'Tratamentos revigorantes para renovar energia e vitalidade',
    tratamentos: [
      'Massagem energizante',
      'Tratamento revitalizante',
      'Esfoliação energética',
      'Banho terapêutico'
    ],
    cor: '#E6B800',
    icone: '✨'
  }
];
