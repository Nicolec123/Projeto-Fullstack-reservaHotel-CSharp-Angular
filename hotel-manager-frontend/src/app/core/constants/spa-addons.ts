/**
 * Add-ons de spa para simulação e reserva (quarto + spa).
 * A pessoa escolhe o tipo e o valor é fixo por opção.
 */
export interface SpaAddOn {
  id: string;
  nome: string;
  duracao: string;
  preco: number;
  descricao: string;
}

export const SPA_ADDONS: SpaAddOn[] = [
  {
    id: 'massagem-60',
    nome: 'Massagem relaxante',
    duracao: '60 min',
    preco: 180,
    descricao: 'Massagem corporal relaxante com óleos essenciais'
  },
  {
    id: 'massagem-90',
    nome: 'Massagem relaxante',
    duracao: '90 min',
    preco: 250,
    descricao: 'Sessão prolongada para relaxamento profundo'
  },
  {
    id: 'massagem-casal',
    nome: 'Massagem em casal',
    duracao: '90 min',
    preco: 420,
    descricao: 'Massagem a dois na mesma sala'
  },
  {
    id: 'acesso-spa',
    nome: 'Acesso ao Spa',
    duracao: 'Dia',
    preco: 80,
    descricao: 'Sauna, piscina térmica e área de descanso'
  },
  {
    id: 'dia-spa',
    nome: 'Dia de Spa',
    duracao: '1 dia',
    preco: 240,
    descricao: 'Acesso ao spa + 1 massagem relaxante 60 min'
  },
  {
    id: 'facial',
    nome: 'Tratamento facial',
    duracao: '50 min',
    preco: 160,
    descricao: 'Limpeza de pele e hidratação facial'
  }
];

export function getSpaAddOn(id: string): SpaAddOn | undefined {
  return SPA_ADDONS.find(a => a.id === id);
}
