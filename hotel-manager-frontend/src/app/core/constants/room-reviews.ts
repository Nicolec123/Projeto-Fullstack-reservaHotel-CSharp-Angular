/**
 * Avaliações simuladas dos quartos (fase 3 - mock data).
 * Avatar gerado via UI Avatars API: https://ui-avatars.com/
 */
export interface RoomReview {
  nome: string;
  data: string;
  nota: number;
  texto: string;
  avatarUrl: string;
}

function avatarUrl(nome: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&size=80&background=B8860B&color=fff`;
}

/** Avaliações por número do quarto */
export const ROOM_REVIEWS: Record<string, RoomReview[]> = {
  '1': [
    {
      nome: 'Ana Paula Costa',
      data: '2024-01-15',
      nota: 5,
      texto: 'Ficamos muito satisfeitos com o quarto! Bem limpo, cama confortável e o Wi-Fi funcionou perfeitamente. O atendimento foi excelente. Voltaremos com certeza.',
      avatarUrl: avatarUrl('Ana Paula Costa')
    },
    {
      nome: 'Carlos Eduardo',
      data: '2024-02-03',
      nota: 4,
      texto: 'Quarto aconchegante e silencioso. A vista para o jardim é linda de manhã. Só senti falta de mais tomadas perto da cama, mas no geral recomendo.',
      avatarUrl: avatarUrl('Carlos Eduardo')
    },
    {
      nome: 'Marina Oliveira',
      data: '2024-02-18',
      nota: 5,
      texto: 'Experiência ótima! O quarto superou as expectativas. Ar-condicionado funcionando bem, banheiro impecável. Perfeito para uma estadia relaxante.',
      avatarUrl: avatarUrl('Marina Oliveira')
    }
  ],
  '2': [
    {
      nome: 'Roberto Santos',
      data: '2024-01-22',
      nota: 5,
      texto: 'Quarto simples mas muito bem cuidado. A relação custo-benefício é excelente. Equipe atenciosa e café da manhã delicioso. Super indico!',
      avatarUrl: avatarUrl('Roberto Santos')
    },
    {
      nome: 'Juliana Mendes',
      data: '2024-02-10',
      nota: 4,
      texto: 'Muito bom! O quarto era exatamente como nas fotos. Limpeza diária impecável. Só o estacionamento que ficou um pouco longe, mas nada que atrapalhe.',
      avatarUrl: avatarUrl('Juliana Mendes')
    }
  ],
  '3': [
    {
      nome: 'Fernando Lima',
      data: '2024-01-28',
      nota: 5,
      texto: 'Quarto luxuoso e bem espaçoso! A cama king é um sonho. Vista panorâmica incrível. Vale cada centavo. Já reservei de novo para o mês que vem.',
      avatarUrl: avatarUrl('Fernando Lima')
    },
    {
      nome: 'Patricia Rocha',
      data: '2024-02-14',
      nota: 5,
      texto: 'Fomos para lua de mel e foi perfeito! Ambiente romântico, amenities de qualidade. O roupão e os chinelos são um mimo. Experiência inesquecível.',
      avatarUrl: avatarUrl('Patricia Rocha')
    },
    {
      nome: 'Lucas Almeida',
      data: '2024-02-25',
      nota: 4,
      texto: 'Ótimo quarto deluxe. Smart TV grande, banheiro moderno. A única coisa é que pedi colchão mais firme e foi resolvido rapidamente. Ótimo atendimento!',
      avatarUrl: avatarUrl('Lucas Almeida')
    }
  ],
  '4': [
    {
      nome: 'Amanda Ferreira',
      data: '2024-02-01',
      nota: 5,
      texto: 'Quarto maravilhoso! Elegante e confortável. Dormi como nunca. O serviço de quarto é rápido e a equipe muito educada. Voltarei em breve!',
      avatarUrl: avatarUrl('Amanda Ferreira')
    },
    {
      nome: 'Bruno Cardoso',
      data: '2024-02-20',
      nota: 5,
      texto: 'Excelente estadia. O quarto luxo tem tudo que precisei para trabalhar: mesa ampla, Wi-Fi estável. À noite, relaxar na cama king foi perfeito.',
      avatarUrl: avatarUrl('Bruno Cardoso')
    }
  ],
  '5': [
    {
      nome: 'Camila e Ricardo',
      data: '2024-01-10',
      nota: 5,
      texto: 'Suíte espetacular! A varanda privativa com aquela vista... sem palavras. Café da manhã incluso é um diferencial. Máquina Nespresso no quarto é luxo!',
      avatarUrl: avatarUrl('Camila Silva')
    },
    {
      nome: 'Sandra Martins',
      data: '2024-02-05',
      nota: 5,
      texto: 'Fizemos aniversário de casamento aqui. A suíte é de outro nível: banheira, amenities premium, serviço 24h. Uma experiência que vale a pena repetir.',
      avatarUrl: avatarUrl('Sandra Martins')
    },
    {
      nome: 'Henrique Gomes',
      data: '2024-02-22',
      nota: 5,
      texto: 'Melhor quarto que já fiquei! Espaço gigante, sofá-cama para as crianças, varanda com vista incrível. O hotel pensou em cada detalhe. Nota 10!',
      avatarUrl: avatarUrl('Henrique Gomes')
    }
  ]
};

export function getRoomReviews(numero: string): RoomReview[] {
  return ROOM_REVIEWS[String(numero)] ?? [];
}

export function getRoomAverageRating(numero: string): number {
  const reviews = getRoomReviews(numero);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.nota, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
