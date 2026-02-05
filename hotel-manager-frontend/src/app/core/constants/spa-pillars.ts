/**
 * Os 3 pilares do spa - inspirado em hotéis de luxo
 */
export interface TratamentoDetalhado {
  nome: string;
  descricao: string;
}

export interface SpaPillar {
  id: string;
  nome: string;
  descricao: string;
  tratamentos: TratamentoDetalhado[];
  cor: string;
  icone: string;
  imagem: string;
}

export const SPA_PILLARS: SpaPillar[] = [
  {
    id: 'detox',
    nome: 'Detox',
    descricao: 'Rituais de purificação profunda para restaurar equilíbrio e leveza',
    tratamentos: [
      {
        nome: 'Drenagem linfática',
        descricao: 'Ritual corporal delicado e altamente eficaz que estimula o sistema linfático, favorecendo a eliminação de toxinas e reduzindo retenções. O resultado é uma sensação imediata de leveza, contornos redefinidos e bem-estar absoluto.'
      },
      {
        nome: 'Esfoliação corporal',
        descricao: 'Tratamento de renovação sensorial com esfoliantes naturais selecionados que refinam a textura da pele, ativam a circulação e revelam uma luminosidade sedosa incomparável.'
      },
      {
        nome: 'Banho de argila',
        descricao: 'Imersão terapêutica com argilas minerais purificantes que absorvem impurezas, reequilibram a energia corporal e proporcionam um estado profundo de relaxamento restaurador.'
      },
      {
        nome: 'Tratamento desintoxicante',
        descricao: 'Protocolo exclusivo que combina técnicas corporais avançadas e ativos botânicos para purificação integral, revitalizando o corpo e restaurando a harmonia interna.'
      }
    ],
    cor: '#2D6A4F',
    icone: '🌿',
    imagem: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop'
  },
  {
    id: 'relaxando',
    nome: 'Relaxando',
    descricao: 'Experiências sensoriais para desacelerar e reconectar corpo e mente',
    tratamentos: [
      {
        nome: 'Massagem relaxante',
        descricao: 'Sequência de movimentos fluidos e envolventes que dissolvem tensões, silenciam a mente e conduzem a um estado profundo de serenidade.'
      },
      {
        nome: 'Shiatsu',
        descricao: 'Terapia japonesa de precisão que atua em pontos energéticos estratégicos, restabelecendo o fluxo vital e promovendo equilíbrio físico e emocional.'
      },
      {
        nome: 'Reflexologia',
        descricao: 'Ritual terapêutico que estimula zonas reflexas nos pés, liberando bloqueios energéticos e induzindo relaxamento global.'
      },
      {
        nome: 'Massagem aromática',
        descricao: 'Experiência multissensorial que une óleos essenciais raros e toques suaves para despertar os sentidos, aliviar o estresse e envolver o corpo em um perfume calmante.'
      },
      {
        nome: 'Tratamento facial',
        descricao: 'Cuidado facial de alto desempenho que hidrata profundamente, revitaliza e ilumina a pele, proporcionando aparência radiante e relaxamento absoluto.'
      }
    ],
    cor: '#A67B5B',
    icone: '🧘',
    imagem: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop'
  },
  {
    id: 'energizando',
    nome: 'Energizando',
    descricao: 'Rituais revigorantes para despertar vitalidade e poder interior',
    tratamentos: [
      {
        nome: 'Massagem energizante',
        descricao: 'Massagem vigorosa e estimulante que ativa a circulação, desperta os músculos e devolve energia vibrante ao corpo.'
      },
      {
        nome: 'Tratamento revitalizante',
        descricao: 'Ritual restaurador que combina técnicas terapêuticas e ativos naturais para reacender a vitalidade e renovar o equilíbrio corporal.'
      },
      {
        nome: 'Esfoliação energética',
        descricao: 'Tratamento estimulante que renova a pele e desperta os sentidos, promovendo frescor intenso e sensação de renovação imediata.'
      },
      {
        nome: 'Banho terapêutico',
        descricao: 'Imersão luxuosa com sais minerais e essências aromáticas que aliviam tensões, purificam a energia e proporcionam profunda restauração.'
      }
    ],
    cor: '#E6B800',
    icone: '✨',
    imagem: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=600&fit=crop'
  }
];
