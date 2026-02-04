import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HOTEL_INFO } from '../../../core/constants/hotel-info';
import { getWhatsAppUrl } from '../../../core/constants/contact';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  readonly hotel = HOTEL_INFO;

  form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    assunto: ['', Validators.required],
    mensagem: ['', Validators.required]
  });

  enviado = false;

  get whatsappUrl() {
    return getWhatsAppUrl('Olá! Gostaria de mais informações sobre o hotel.');
  }

  submit() {
    if (this.form.invalid) return;
    this.enviado = true;
    this.form.reset();
  }
}
