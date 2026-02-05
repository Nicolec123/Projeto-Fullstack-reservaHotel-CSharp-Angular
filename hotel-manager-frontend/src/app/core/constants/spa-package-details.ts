/**
 * Descrições detalhadas e imagens dos pacotes promocionais do spa
 */

export interface SpaPackageDetail {
  imagens: string[]; // Imagens do spa/pacote
  imagensQuarto?: string[]; // Imagens específicas do quarto
  videoUrl?: string; // URL do vídeo do quarto (opcional)
  descricaoCompleta: string;
  oQueEstaIncluido: {
    titulo: string;
    itens: string[];
  };
  oQueNaoEstaIncluido: {
    titulo: string;
    itens: string[];
  };
  informacoesQuarto: {
    tipo: string;
    metragem: string;
    capacidade: string;
    equipamentos: string[];
    descricaoCompleta?: string; // Descrição detalhada do quarto
    vista?: string; // Vista do quarto
    banheiro?: string; // Descrição do banheiro
    experiencia?: string; // Experiência no quarto
  };
  informacoesSpa: {
    tratamentos: string[];
    acessos: string[];
    duracao: string;
  };
  informacoesAdicionais: string[];
}

export const SPA_PACKAGE_DETAILS: Record<string, SpaPackageDetail> = {
  '1': {
    imagens: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
      'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1200',
      'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=1200'
    ],
    imagensQuarto: [
      '/quartosdehotel/Quarto1/pexels-byung-chul-min-2151741451-35632438.jpg',
      '/quartosdehotel/Quarto1/pexels-cottonbro-5371573.jpg',
      '/quartosdehotel/Quarto1/pexels-cottonbro-6466216.jpg',
      '/quartosdehotel/Quarto1/pexels-didi-lecatompessy-2149441489-33125906.jpg'
    ],
    descricaoCompleta: 'O pacote Relaxamento Total oferece uma experiência completa de bem-estar, combinando hospedagem confortável com tratamentos de spa de alta qualidade. Ideal para quem busca uma pausa revigorante e momentos de tranquilidade.',
    oQueEstaIncluido: {
      titulo: 'O que está incluído',
      itens: [
        '1 noite de hospedagem em quarto padrão',
        'Massagem relaxante de 60 minutos com óleos aromáticos',
        'Acesso ilimitado à sauna e piscina térmica durante toda a estadia',
        'Chá e frutas frescas no spa',
        'Wi-Fi gratuito',
        'Limpeza diária do quarto',
        'Toalhas e amenities do hotel',
        'Estacionamento (se disponível)'
      ]
    },
    oQueNaoEstaIncluido: {
      titulo: 'O que não está incluído',
      itens: [
        'Café da manhã (disponível por taxa adicional)',
        'Tratamentos adicionais no spa',
        'Refeições no restaurante',
        'Bebidas alcoólicas',
        'Serviço de quarto',
        'Lavanderia',
        'Tratamentos faciais ou corporais extras'
      ]
    },
    informacoesQuarto: {
      tipo: 'Quarto Padrão (Standard)',
      metragem: '25m²',
      capacidade: '1-2 pessoas',
      equipamentos: [
        'Cama queen size',
        'Ar-condicionado',
        'TV 32"',
        'Frigobar',
        'Wi-Fi gratuito',
        'Banheiro privativo',
        'Secador de cabelo',
        'Mesa de trabalho'
      ],
      descricaoCompleta: 'Quarto Standard de 25m² com cama queen size, ideal para até 2 hóspedes. Janela com iluminação natural e vista para o jardim interno do hotel. O quarto oferece ambiente acolhedor e funcional, equipado com ar-condicionado, Wi-Fi gratuito, TV 32", frigobar e mesa de trabalho. Banheiro privativo com ducha quente, amenities essenciais e secador de cabelo. Limpeza diária e toalhas inclusas.',
      vista: 'Janela com iluminação natural e vista para o jardim interno do hotel.',
      banheiro: 'Banheiro privativo com ducha quente, amenities essenciais e secador de cabelo.',
      experiencia: 'Ambiente acolhedor e funcional, pensado para quem busca conforto e praticidade.'
    },
    informacoesSpa: {
      tratamentos: [
        'Massagem relaxante de 60 minutos',
        'Uso de óleos aromáticos terapêuticos'
      ],
      acessos: [
        'Sauna seca e úmida',
        'Piscina térmica',
        'Área de relaxamento',
        'Vestiários completos'
      ],
      duracao: 'Acesso durante toda a estadia'
    },
    informacoesAdicionais: [
      'Check-in a partir das 14h e check-out até 12h',
      'Massagem deve ser agendada com antecedência',
      'Acesso ao spa disponível das 8h às 22h',
      'Recomendamos trazer roupa de banho e chinelos'
    ]
  },
  '2': {
    imagens: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200',
      'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1200',
      'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=1200'
    ],
    imagensQuarto: [
      '/quartosdehotel/Quarto1/pexels-byung-chul-min-2151741451-35632438.jpg',
      '/quartosdehotel/Quarto1/pexels-cottonbro-5371573.jpg',
      '/quartosdehotel/Quarto1/pexels-cottonbro-6466216.jpg',
      '/quartosdehotel/Quarto1/pexels-didi-lecatompessy-2149441489-33125906.jpg'
    ],
    descricaoCompleta: 'O pacote Fim de Semana Wellness é perfeito para uma escapada completa de dois dias. Inclui hospedagem confortável, tratamentos completos de spa e acesso ilimitado às instalações de bem-estar.',
    oQueEstaIncluido: {
      titulo: 'O que está incluído',
      itens: [
        '2 noites de hospedagem com café da manhã incluso',
        'Massagem relaxante de 90 minutos',
        'Tratamento facial de 60 minutos',
        'Acesso ilimitado ao spa durante toda a estadia',
        'Jantar wellness no restaurante do hotel (1x)',
        'Chá e frutas frescas no spa',
        'Wi-Fi gratuito',
        'Limpeza diária do quarto',
        'Toalhas e amenities premium',
        'Estacionamento'
      ]
    },
    oQueNaoEstaIncluido: {
      titulo: 'O que não está incluído',
      itens: [
        'Almoços e outros jantares',
        'Bebidas alcoólicas',
        'Tratamentos adicionais no spa',
        'Serviço de quarto',
        'Lavanderia',
        'Tratamentos corporais extras',
        'Atividades externas'
      ]
    },
    informacoesQuarto: {
      tipo: 'Quarto Padrão (Standard)',
      metragem: '25m²',
      capacidade: '1-2 pessoas',
      equipamentos: [
        'Cama queen size',
        'Ar-condicionado',
        'Smart TV 43"',
        'Frigobar',
        'Wi-Fi gratuito',
        'Banheiro privativo',
        'Secador de cabelo',
        'Cofre',
        'Mesa de trabalho'
      ],
      descricaoCompleta: 'Quarto Standard de 25m² com cama queen size, ideal para até 2 hóspedes. Janela com iluminação natural e vista para o jardim interno do hotel. O quarto oferece ambiente acolhedor e funcional, equipado com ar-condicionado, Wi-Fi gratuito, Smart TV 43", frigobar e mesa de trabalho. Banheiro privativo com ducha quente, amenities essenciais e secador de cabelo. Limpeza diária e toalhas inclusas.',
      vista: 'Janela com iluminação natural e vista para o jardim interno do hotel.',
      banheiro: 'Banheiro privativo com ducha quente, amenities essenciais e secador de cabelo.',
      experiencia: 'Ambiente acolhedor e funcional, pensado para quem busca conforto e praticidade.'
    },
    informacoesSpa: {
      tratamentos: [
        'Massagem relaxante de 90 minutos',
        'Tratamento facial de 60 minutos',
        'Uso de produtos premium'
      ],
      acessos: [
        'Sauna seca e úmida',
        'Piscina térmica',
        'Área de relaxamento',
        'Vestiários completos',
        'Área de meditação'
      ],
      duracao: 'Acesso durante toda a estadia'
    },
    informacoesAdicionais: [
      'Check-in a partir das 14h e check-out até 12h',
      'Tratamentos devem ser agendados com antecedência',
      'Acesso ao spa disponível das 8h às 22h',
      'Jantar wellness inclui menu balanceado e nutritivo',
      'Recomendamos trazer roupa de banho e chinelos'
    ]
  },
  '3': {
    imagens: [
      'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1200',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
      'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=1200'
    ],
    imagensQuarto: [
      '/quartosdehotel/Quarto3/pexels-aj-ahamad-767001191-32168943.jpg',
      '/quartosdehotel/Quarto3/pexels-mographe-34955133.jpg',
      '/quartosdehotel/Quarto3/pexels-svh-manali-1801124329-28347477.jpg',
      '/quartosdehotel/Quarto3/pexels-tima-miroshnichenko-6010267.jpg'
    ],
    descricaoCompleta: 'O pacote Lua de Mel Spa é a escolha perfeita para casais que buscam uma experiência romântica e relaxante. Inclui suíte exclusiva com varanda privativa, tratamentos em casal e momentos especiais de intimidade.',
    oQueEstaIncluido: {
      titulo: 'O que está incluído',
      itens: [
        '3 noites em suíte com varanda privativa',
        'Massagem em casal de 90 minutos',
        'Banheira de hidromassagem na suíte',
        'Jantar romântico à luz de velas',
        'Champagne de boas-vindas',
        'Café da manhã incluso todos os dias',
        'Acesso ilimitado ao spa',
        'Wi-Fi gratuito',
        'Serviço de quarto 24h',
        'Roupões e chinelos',
        'Estacionamento'
      ]
    },
    oQueNaoEstaIncluido: {
      titulo: 'O que não está incluído',
      itens: [
        'Almoços',
        'Bebidas adicionais além do champagne',
        'Tratamentos faciais ou corporais extras',
        'Lavanderia',
        'Atividades externas',
        'Decoração especial adicional'
      ]
    },
    informacoesQuarto: {
      tipo: 'Suíte',
      metragem: '45m²',
      capacidade: '2-4 pessoas',
      equipamentos: [
        'Cama king size',
        'Varanda privativa',
        'Banheira de hidromassagem',
        'Ar-condicionado',
        'Smart TV 55"',
        'Frigobar premium',
        'Mini-bar',
        'Wi-Fi gratuito',
        'Banheiro amplo',
        'Secador profissional',
        'Máquina de café Nespresso',
        'Cofre'
      ],
      descricaoCompleta: 'Suíte de 45m² com cama king size e sofá-cama, varanda privativa e vista panorâmica. Ambiente exclusivo e relaxante, equipado com ar-condicionado, Wi-Fi gratuito, Smart TV 55", frigobar premium e mini-bar. Banheiro amplo com banheira ou ducha de hidromassagem, amenities premium. Café da manhã incluso, serviço de quarto 24h, roupões, chinelos e máquina Nespresso.',
      vista: 'Varanda privativa com vista panorâmica. Andar alto, iluminação natural em abundância.',
      banheiro: 'Banheiro amplo com banheira ou ducha de hidromassagem, amenities premium e secador profissional.',
      experiencia: 'Ambiente exclusivo e relaxante. O máximo em conforto e sofisticação para uma estadia inesquecível.'
    },
    informacoesSpa: {
      tratamentos: [
        'Massagem em casal de 90 minutos',
        'Ambiente privativo para casais',
        'Uso de óleos aromáticos especiais'
      ],
      acessos: [
        'Sauna seca e úmida',
        'Piscina térmica',
        'Área de relaxamento exclusiva',
        'Vestiários completos',
        'Área de meditação'
      ],
      duracao: 'Acesso durante toda a estadia'
    },
    informacoesAdicionais: [
      'Check-in a partir das 14h e check-out até 12h',
      'Massagem em casal deve ser agendada com antecedência',
      'Acesso ao spa disponível das 8h às 22h',
      'Jantar romântico inclui menu especial para casais',
      'Champagne será servido no check-in',
      'Decoração especial pode ser solicitada (taxa adicional)'
    ]
  }
};

export function getSpaPackageDetail(id: string): SpaPackageDetail | undefined {
  return SPA_PACKAGE_DETAILS[id];
}

export function getSpaPackageImages(id: string): string[] {
  return SPA_PACKAGE_DETAILS[id]?.imagens ?? [];
}
