/**
 * Pacotes Hotel + Spa e avaliações do spa
 */
export interface SpaPackage {
  id: string;
  titulo: string;
  descricao: string;
  imagem: string;
  duracao: string;
  precoDesde: string;
  itens: string[];
}

export interface SpaReview {
  nome: string;
  data: string;
  nota: number;
  texto: string;
  avatarUrl: string;
}

function avatarUrl(nome: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&size=64&background=2D6A4F&color=fff`;
}

export const SPA_PACKAGES: SpaPackage[] = [
  {
    id: '1',
    titulo: 'Relaxamento Total',
    descricao: 'Hospedagem + massagem relaxante + acesso ao spa',
    imagem: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600',
    duracao: '1 noite + 1h spa',
    precoDesde: 'A partir de R$ 890',
    itens: ['1 noite em quarto padrão', 'Massagem relaxante 60min', 'Acesso à sauna e piscina térmica', 'Chá e frutas no spa']
  },
  {
    id: '2',
    titulo: 'Fim de Semana Wellness',
    descricao: 'Dois dias de hospedagem com tratamentos completos',
    imagem: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600',
    duracao: '2 noites + 2 sessões',
    precoDesde: 'A partir de R$ 1.690',
    itens: ['2 noites com café da manhã', 'Massagem + facial 90min', 'Acesso ilimitado ao spa', 'Jantar wellness no restaurante']
  },
  {
    id: '3',
    titulo: 'Lua de Mel Spa',
    descricao: 'Suíte romântica e experiências a dois no spa',
    imagem: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600',
    duracao: '3 noites',
    precoDesde: 'A partir de R$ 2.490',
    itens: ['Suíte com varanda privativa', 'Massagem em casal 90min', 'Banheira de hidromassagem', 'Jantar romântico e champagne']
  }
];

export const SPA_REVIEWS: SpaReview[] = [
  {
    nome: 'Fernanda Lima',
    data: 'Fev 2024',
    nota: 5,
    texto: 'O spa é o ponto alto do hotel. Massagem incrível, ambiente calmo e profissionais muito qualificados. Voltarei com certeza.',
    avatarUrl: avatarUrl('Fernanda Lima')
  },
  {
    nome: 'Ricardo Alves',
    data: 'Jan 2024',
    nota: 5,
    texto: 'Fiz o pacote Relaxamento Total. Saí renovado. A sauna e a piscina térmica são um mimo. Recomendo demais.',
    avatarUrl: avatarUrl('Ricardo Alves')
  },
  {
    nome: 'Carla Mendes',
    data: 'Fev 2024',
    nota: 5,
    texto: 'Melhor spa que já conheci. Tratamentos de qualidade, óleos aromáticos e uma equipe que realmente cuida do cliente.',
    avatarUrl: avatarUrl('Carla Mendes')
  }
];
