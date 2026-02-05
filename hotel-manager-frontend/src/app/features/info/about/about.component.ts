import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HOTEL_INFO } from '../../../core/constants/hotel-info';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  private readonly router = inject(Router);

  readonly hotel = HOTEL_INFO;

  readonly spaImages = [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
    'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
  ];

  readonly testimonials = [
    {
      text: 'A experiência mais relaxante que já vivi. O spa é um verdadeiro refúgio.',
      author: 'Marina A.'
    },
    {
      text: 'Cada detalhe transmite cuidado. Saí renovado física e emocionalmente.',
      author: 'Rafael M.'
    },
    {
      text: 'O Ritual Signature é simplesmente transformador.',
      author: 'Camila T.'
    },
    {
      text: 'Silêncio, aroma, atendimento impecável. Perfeito.',
      author: 'Eduardo L.'
    }
  ];

  readonly faqs = [
    {
      question: 'Como faço para agendar um tratamento?',
      answer: 'Você pode agendar através do nosso site, por telefone ou diretamente na recepção do spa. Recomendamos reserva prévia para garantir disponibilidade.'
    },
    {
      question: 'Quanto tempo antes devo chegar?',
      answer: 'Solicitamos que chegue com 15 minutos de antecedência para preenchimento de ficha e preparação para o tratamento.'
    },
    {
      question: 'Os tratamentos são adequados para gestantes?',
      answer: 'Oferecemos tratamentos específicos para gestantes. Consulte nossa equipe para recomendações personalizadas.'
    },
    {
      question: 'Posso cancelar ou remarcar meu agendamento?',
      answer: 'Sim, cancelamentos ou remarcações podem ser feitos até 24 horas antes do horário agendado sem custos adicionais.'
    },
    {
      question: 'Há pacotes disponíveis?',
      answer: 'Sim, oferecemos pacotes para casais, experiências VIP privadas e gift cards. Consulte nossa equipe para mais informações.'
    }
  ];

  scrollToBooking(): void {
    this.router.navigate(['/spa/agendar']);
  }

  agendarPacote(pacoteId: string): void {
    this.router.navigate(['/spa/agendar'], { queryParams: { pacote: pacoteId } });
  }

  agendarCasal(): void {
    this.agendarPacote('spa-casal');
  }

  agendarVIP(): void {
    this.agendarPacote('spa-individual'); // Por enquanto, VIP usa individual
  }

  agendarGiftCard(): void {
    this.router.navigate(['/spa/agendar'], { queryParams: { tipo: 'giftcard' } });
  }
}
