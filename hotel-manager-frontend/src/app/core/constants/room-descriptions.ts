/**
 * Descrições completas dos quartos por tipo/categoria.
 * Usado na página de detalhes de cada quarto.
 */
export interface RoomDescription {
  metragem: string;
  capacidade: string;
  cama: string;
  resumo: string;
  vista: string;
  banheiro: string;
  equipamentos: string;
  extras: string;
  experiencia: string;
  descricaoCompleta: string;
}

export const ROOM_DESCRIPTIONS: Record<string, RoomDescription> = {
  Standard: {
    metragem: '25m²',
    capacidade: '2 adultos',
    cama: 'Cama queen size',
    resumo: 'Quarto Standard de 25m² com cama queen size, ideal para até 2 hóspedes.',
    vista: 'Janela com iluminação natural e vista para o jardim interno do hotel.',
    banheiro: 'Banheiro privativo com ducha quente, amenities essenciais e secador de cabelo.',
    equipamentos: 'Equipado com Wi-Fi gratuito, TV 32", ar-condicionado e frigobar.',
    extras: 'Limpeza diária, toalhas e roupas de cama inclusas.',
    experiencia: 'Ambiente acolhedor e funcional, pensado para quem busca conforto e praticidade.',
    descricaoCompleta: 'Quarto Standard de 25m² com cama queen size, ideal para até 2 hóspedes. Janela com iluminação natural e vista para o jardim. O quarto oferece ambiente acolhedor e funcional, equipado com ar-condicionado, Wi-Fi gratuito, TV 32", frigobar e mesa de trabalho. Banheiro privativo com ducha quente, amenities essenciais e secador de cabelo. Limpeza diária e toalhas inclusas.'
  },
  Luxo: {
    metragem: '32m²',
    capacidade: '2 adultos / 3 hóspedes',
    cama: 'Cama king size ou Twin',
    resumo: 'Quarto Deluxe de 32m² com cama king size, ideal para até 3 hóspedes.',
    vista: 'Vista panorâmica para a cidade ou jardim, com janela ampla e iluminação natural.',
    banheiro: 'Banheiro moderno com ducha de alta pressão, amenities premium e secador de cabelo.',
    equipamentos: 'Wi-Fi gratuito, Smart TV 43", ar-condicionado, frigobar, cofre e mesa de trabalho.',
    extras: 'Limpeza diária, serviço de quarto, roupões e chinelos disponíveis.',
    experiencia: 'Ambiente elegante e sofisticado, perfeito para quem busca conforto e um toque de requinte.',
    descricaoCompleta: 'Quarto Deluxe de 32m² com cama king size, ideal para até 3 hóspedes. Vista panorâmica com janela ampla. O quarto oferece ambiente elegante e sofisticado, equipado com ar-condicionado, Wi-Fi gratuito, Smart TV 43", frigobar, cofre e mesa de trabalho. Banheiro moderno com ducha de alta pressão, amenities premium e secador. Limpeza diária, serviço de quarto, roupões e chinelos.'
  },
  Suíte: {
    metragem: '45m²',
    capacidade: '2 adultos / 4 hóspedes',
    cama: 'Cama king size + sofá-cama',
    resumo: 'Suíte de 45m² com cama king size e sofá-cama, ideal para até 4 hóspedes.',
    vista: 'Varanda privativa com vista panorâmica. Andar alto, iluminação natural em abundância.',
    banheiro: 'Banheiro amplo com banheira ou ducha de hidromassagem, amenities premium e secador profissional.',
    equipamentos: 'Wi-Fi gratuito, Smart TV 55", ar-condicionado, frigobar premium, cofre, mesa de trabalho e mini-bar.',
    extras: 'Café da manhã incluso, serviço de quarto 24h, roupões e chinelos, máquina de café Nespresso.',
    experiencia: 'Ambiente exclusivo e relaxante. O máximo em conforto e sofisticação para uma estadia inesquecível.',
    descricaoCompleta: 'Suíte de 45m² com cama king size e sofá-cama, varanda privativa e vista panorâmica. Ambiente exclusivo e relaxante, equipado com ar-condicionado, Wi-Fi gratuito, Smart TV 55", frigobar premium e mini-bar. Banheiro amplo com banheira ou ducha de hidromassagem, amenities premium. Café da manhã incluso, serviço de quarto 24h, roupões, chinelos e máquina Nespresso.'
  }
};

export function getRoomDescription(tipo: string): RoomDescription {
  return ROOM_DESCRIPTIONS[tipo] ?? ROOM_DESCRIPTIONS['Standard'];
}
