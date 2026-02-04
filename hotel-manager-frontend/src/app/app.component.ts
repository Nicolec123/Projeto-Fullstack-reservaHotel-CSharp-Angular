import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Login vindo do Admin: mostra menu simplificado (sem Entrar/Admin) */
  get isAdminLoginFlow(): boolean {
    const url = this.router.url;
    return url.startsWith('/login') && url.includes('returnUrl') && url.includes('admin');
  }
}
