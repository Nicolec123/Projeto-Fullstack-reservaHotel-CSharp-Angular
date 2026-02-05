import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private sub: any;

  /** Esconde o footer na rota do painel admin */
  isAdminRoute = signal(false);

  ngOnInit(): void {
    this.isAdminRoute.set(this.router.url.startsWith('/admin'));
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.isAdminRoute.set(this.router.url.startsWith('/admin')));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /** Login vindo do Admin: mostra menu simplificado (sem Entrar/Admin) */
  get isAdminLoginFlow(): boolean {
    const url = this.router.url;
    return url.startsWith('/login') && url.includes('returnUrl') && url.includes('admin');
  }
}
