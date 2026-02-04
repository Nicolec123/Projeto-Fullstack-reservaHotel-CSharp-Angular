/**
 * Detalhes completos de cada serviço do hotel
 */
export interface ServiceDetail {
  id: string;
  titulo: string;
  icon: string;
  descricaoCurta: string;
  descricaoCompleta: string;
  imagens: string[];
  horario?: string;
  localizacao?: string;
  capacidade?: string;
  itensInclusos?: string[];
  informacoesAdicionais?: string[];
  preco?: string;
  contato?: string;
}

export const SERVICE_DETAILS: ServiceDetail[] = [
  {
    id: 'piscina',
    titulo: 'Piscina',
    icon: '🏊',
    descricaoCurta: 'Piscina aquecida com vista panorâmica',
    descricaoCompleta: 'Desfrute da nossa piscina aquecida com vista panorâmica da cidade. O ambiente é perfeito para relaxar após um dia de trabalho ou explorar a cidade. A piscina está disponível durante todo o ano, com temperatura controlada para seu conforto.',
    imagens: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
      'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=1200'
    ],
    horario: '6h às 22h',
    localizacao: 'Terraço do 10º andar',
    capacidade: 'Até 30 pessoas',
    itensInclusos: [
      'Piscina aquecida (28-30°C)',
      'Área de solário com espreguiçadeiras',
      'Bar de piscina',
      'Toalhas e guarda-sóis disponíveis',
      'Vista panorâmica da cidade'
    ],
    informacoesAdicionais: [
      'Uso exclusivo para hóspedes',
      'Crianças devem estar acompanhadas',
      'Não é permitido mergulho',
      'Área de banho disponível'
    ]
  },
  {
    id: 'academia',
    titulo: 'Academia',
    icon: '💪',
    descricaoCurta: 'Academia 24h totalmente equipada',
    descricaoCompleta: 'Mantenha sua rotina de exercícios na nossa academia totalmente equipada, disponível 24 horas por dia. Com equipamentos modernos e espaço amplo, você pode treinar no horário que preferir.',
    imagens: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200'
    ],
    horario: '24 horas',
    localizacao: '2º andar',
    capacidade: 'Até 15 pessoas simultaneamente',
    itensInclusos: [
      'Equipamentos de musculação',
      'Esteiras e bicicletas ergométricas',
      'Pesos livres e halteres',
      'Área de alongamento',
      'Água e toalhas disponíveis',
      'Vestiários completos'
    ],
    informacoesAdicionais: [
      'Uso exclusivo para hóspedes',
      'Recomendado uso de roupas adequadas',
      'Equipamentos sanitizados regularmente'
    ]
  },
  {
    id: 'restaurante',
    titulo: 'Restaurante',
    icon: '🍽️',
    descricaoCurta: 'Culinária regional e internacional',
    descricaoCompleta: 'Nosso restaurante oferece uma experiência gastronômica única, combinando pratos da culinária regional brasileira com especialidades internacionais. Ambiente elegante e acolhedor, perfeito para refeições em família, encontros de negócios ou jantares românticos.',
    imagens: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200'
    ],
    horario: 'Café da manhã: 6h30 às 10h30 | Almoço: 12h às 15h | Jantar: 19h às 23h',
    localizacao: 'Térreo',
    capacidade: '120 lugares',
    itensInclusos: [
      'Cardápio à la carte',
      'Buffet de café da manhã',
      'Menu executivo para almoço',
      'Carta de vinhos selecionados',
      'Ambiente climatizado',
      'Estacionamento para clientes'
    ],
    informacoesAdicionais: [
      'Reservas recomendadas para jantar',
      'Aceita cartões e dinheiro',
      'Menu vegetariano disponível',
      'Acessível para cadeirantes'
    ],
    contato: 'Para reservas: (11) 99999-9999'
  },
  {
    id: 'spa',
    titulo: 'Spa',
    icon: '🧘',
    descricaoCurta: 'Tratamentos relaxantes e massagens',
    descricaoCompleta: 'Um verdadeiro refúgio urbano dedicado à saúde e ao bem-estar. Nossos terapeutas experientes proporcionam experiências multi-sensoriais com ampla variedade de massagens, tratamentos faciais e corporais. Ambiente aconchegante feito para acalmar o corpo e a mente.',
    imagens: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200',
      'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1200'
    ],
    horario: '9h às 21h',
    localizacao: '3º andar',
    capacidade: '6 cabines de tratamento',
    itensInclusos: [
      'Massagens relaxantes e terapêuticas',
      'Tratamentos faciais',
      'Sauna e piscina térmica',
      'Área de relaxamento com ofurôs',
      'Ducha escocesa',
      'Deck com espreguiçadeiras',
      'Chá e frutas frescas'
    ],
    informacoesAdicionais: [
      'Reservas com antecedência recomendadas',
      'Tratamentos para casais disponíveis',
      'Pacotes especiais para hóspedes',
      'Produtos premium utilizados'
    ],
    contato: 'Agendamentos: (11) 99999-9999'
  },
  {
    id: 'estacionamento',
    titulo: 'Estacionamento',
    icon: '🅿️',
    descricaoCurta: 'Vagas gratuitas para hóspedes',
    descricaoCompleta: 'Estacionamento coberto e seguro para sua tranquilidade. Vagas gratuitas para todos os hóspedes durante toda a estadia. Sistema de segurança 24 horas e fácil acesso ao hotel.',
    imagens: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200'
    ],
    horario: '24 horas',
    localizacao: 'Subsolo',
    capacidade: '50 vagas',
    itensInclusos: [
      'Vagas cobertas',
      'Segurança 24 horas',
      'Acesso por cartão magnético',
      'Vagas para pessoas com deficiência',
      'Área para motos'
    ],
    informacoesAdicionais: [
      'Gratuito para hóspedes',
      'Taxa para visitantes: R$ 20/dia',
      'Valet service disponível (sob consulta)'
    ]
  },
  {
    id: 'wifi',
    titulo: 'Wi-Fi',
    icon: '📶',
    descricaoCurta: 'Internet de alta velocidade gratuita',
    descricaoCompleta: 'Wi-Fi de alta velocidade disponível em todo o hotel, incluindo quartos, áreas comuns, restaurante e spa. Conexão estável e rápida para suas necessidades de trabalho e entretenimento.',
    imagens: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200'
    ],
    horario: '24 horas',
    localizacao: 'Todo o hotel',
    itensInclusos: [
      'Wi-Fi gratuito ilimitado',
      'Alta velocidade (até 100 Mbps)',
      'Cobertura em todas as áreas',
      'Múltiplos dispositivos por quarto',
      'Suporte técnico disponível'
    ],
    informacoesAdicionais: [
      'Senha fornecida no check-in',
      'Rede segura e criptografada',
      'Ideal para videoconferências'
    ]
  },
  {
    id: 'room-service',
    titulo: 'Room Service',
    icon: '☕',
    descricaoCurta: 'Serviço de quarto 24 horas',
    descricaoCompleta: 'Desfrute de refeições, bebidas e lanches no conforto do seu quarto. Nosso room service está disponível 24 horas por dia, com cardápio completo do restaurante e opções rápidas para qualquer hora do dia ou da noite.',
    imagens: [
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200',
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200'
    ],
    horario: '24 horas',
    localizacao: 'Todos os quartos',
    itensInclusos: [
      'Cardápio completo do restaurante',
      'Opções de café da manhã',
      'Lanches e petiscos',
      'Bebidas e vinhos',
      'Serviço rápido e discreto'
    ],
    informacoesAdicionais: [
      'Pedidos pelo telefone do quarto',
      'Taxa de serviço: 15%',
      'Tempo médio de entrega: 30-45 min',
      'Aceita cartões e conta do quarto'
    ],
    contato: 'Disque 9 no telefone do quarto'
  },
  {
    id: 'transfer',
    titulo: 'Transfer',
    icon: '✈️',
    descricaoCurta: 'Transfer aeroporto disponível',
    descricaoCompleta: 'Serviço de transfer confortável e pontual do e para o aeroporto. Veículos modernos e motoristas profissionais para garantir uma chegada e partida sem preocupações.',
    imagens: [
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200'
    ],
    horario: '24 horas (com agendamento)',
    localizacao: 'Recepção',
    capacidade: 'Até 4 passageiros por veículo',
    itensInclusos: [
      'Veículos modernos e confortáveis',
      'Motoristas profissionais',
      'Acompanhamento de voos',
      'Assistência com bagagens',
      'Água e jornais disponíveis'
    ],
    informacoesAdicionais: [
      'Agendamento com 24h de antecedência',
      'Preço: R$ 150 (aeroporto) / R$ 80 (centro)',
      'Disponível para grupos maiores',
      'Aceita cartões'
    ],
    contato: 'Reservas: (11) 99999-9999'
  },
  {
    id: 'eventos',
    titulo: 'Eventos',
    icon: '🎉',
    descricaoCurta: 'Salas para eventos e celebrações',
    descricaoCompleta: 'Espaços elegantes e versáteis para seus eventos corporativos, sociais e celebrações especiais. Nossa equipe especializada em eventos está pronta para tornar sua ocasião memorável, desde pequenas reuniões até grandes celebrações.',
    imagens: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
      'https://images.unsplash.com/photo-1519167758481-83f29da2c1f2?w=1200',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200'
    ],
    horario: 'Segunda a domingo, 8h às 24h',
    localizacao: '2º e 3º andares',
    capacidade: 'De 20 a 300 pessoas',
    itensInclusos: [
      'Salas de reunião equipadas',
      'Salão de eventos para até 300 pessoas',
      'Equipamentos audiovisuais',
      'Serviço de coffee break',
      'Decoração personalizada',
      'Equipe de apoio especializada',
      'Estacionamento para convidados',
      'Sistema de som e iluminação'
    ],
    informacoesAdicionais: [
      'Pacotes personalizados disponíveis',
      'Catering completo opcional',
      'Espaços para casamentos e festas',
      'Eventos corporativos e treinamentos',
      'Acessibilidade completa'
    ],
    contato: 'Eventos: eventos@hotelvistaserena.com.br | (11) 99999-9999'
  }
];

export function getServiceDetail(id: string): ServiceDetail | undefined {
  return SERVICE_DETAILS.find(s => s.id === id);
}
