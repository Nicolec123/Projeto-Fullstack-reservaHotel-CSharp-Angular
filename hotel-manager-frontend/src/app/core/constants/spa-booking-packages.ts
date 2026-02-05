/**
 * Pacotes de Spa para agendamento standalone
 * Individual, Casal e Família (promocional)
 */
export interface SpaBookingPackage {
  id: string;
  tipo: 'individual' | 'casal' | 'familia';
  nome: string;
  descricao: string;
  precoBase: number;
  duracao: string;
  pessoasIncluidas: number;
  pessoasMaximas?: number; // Para família
  precoPorPessoaExtra?: number; // Para família
  itensInclusos: string[];
  imagem: string;
  popular?: boolean;
}

export const SPA_BOOKING_PACKAGES: SpaBookingPackage[] = [
  {
    id: 'spa-individual',
    tipo: 'individual',
    nome: 'Pacote Individual',
    descricao: 'Experiência completa de bem-estar para uma pessoa',
    precoBase: 350,
    duracao: '90 minutos',
    pessoasIncluidas: 1,
    itensInclusos: [
      'Massagem relaxante profunda (60min)',
      'Tratamento facial regenerador (30min)',
      'Acesso à área sensorial com ofurôs',
      'Chá de ervas calmantes',
      'Produtos de higiene pessoal premium'
    ],
    imagem: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
    popular: false
  },
  {
    id: 'spa-casal',
    tipo: 'casal',
    nome: 'Pacote Casal',
    descricao: 'Ritual romântico para dois em ambiente privativo',
    precoBase: 650,
    duracao: '120 minutos',
    pessoasIncluidas: 2,
    itensInclusos: [
      'Massagem em casal (90min)',
      'Banho terapêutico compartilhado',
      'Sala privativa com música ambiente',
      'Champagne e frutas frescas',
      'Acesso à área de relaxamento',
      'Produtos de higiene pessoal premium'
    ],
    imagem: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800',
    popular: true
  },
  {
    id: 'spa-familia',
    tipo: 'familia',
    nome: 'Pacote Família',
    descricao: 'Experiência promocional para até 4 pessoas. Valor adicional por membro extra',
    precoBase: 1200,
    duracao: '90 minutos',
    pessoasIncluidas: 4,
    pessoasMaximas: 8,
    precoPorPessoaExtra: 280,
    itensInclusos: [
      'Massagem relaxante para cada membro (60min)',
      'Tratamento facial regenerador (30min)',
      'Acesso à área sensorial com ofurôs',
      'Sala de espera familiar',
      'Chá de ervas e lanches saudáveis',
      'Produtos de higiene pessoal premium',
      'Atendimento personalizado'
    ],
    imagem: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    popular: false
  }
];

export function getSpaBookingPackage(id: string): SpaBookingPackage | undefined {
  return SPA_BOOKING_PACKAGES.find(p => p.id === id);
}

export function calculateSpaPackagePrice(packageId: string, numPessoas: number): number {
  const pkg = getSpaBookingPackage(packageId);
  if (!pkg) return 0;
  
  if (pkg.tipo === 'familia' && numPessoas > pkg.pessoasIncluidas) {
    const pessoasExtras = numPessoas - pkg.pessoasIncluidas;
    return pkg.precoBase + (pessoasExtras * (pkg.precoPorPessoaExtra || 0));
  }
  
  return pkg.precoBase;
}
