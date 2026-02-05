import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { clientGuard } from './core/guards/client.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'quartos', loadComponent: () => import('./features/rooms/room-list/room-list.component').then(m => m.RoomListComponent) },
  { path: 'quartos/:id/simular', loadComponent: () => import('./features/reservations/simular/simular.component').then(m => m.SimularComponent) },
  { path: 'quartos/:id', loadComponent: () => import('./features/rooms/room-detail/room-detail.component').then(m => m.RoomDetailComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'cadastro', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'reservar/:id', loadComponent: () => import('./features/reservations/reserve/reserve.component').then(m => m.ReserveComponent), canActivate: [authGuard, clientGuard] },
  { path: 'minhas-reservas', loadComponent: () => import('./features/reservations/my-reservations/my-reservations.component').then(m => m.MyReservationsComponent), canActivate: [authGuard] },
  { path: 'admin', loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent), canActivate: [authGuard, adminGuard] },
  { path: 'sobre', loadComponent: () => import('./features/info/about/about.component').then(m => m.AboutComponent) },
  { path: 'spa/agendar', loadComponent: () => import('./features/spa/spa-booking/spa-booking.component').then(m => m.SpaBookingComponent) },
  { path: 'spa/pacote/:id/detalhes', loadComponent: () => import('./features/spa/spa-package-detail/spa-package-detail.component').then(m => m.SpaPackageDetailComponent) },
  { path: 'spa/pacote/:id', loadComponent: () => import('./features/spa/spa-promotional-package/spa-promotional-package.component').then(m => m.SpaPromotionalPackageComponent) },
  { path: 'servicos', loadComponent: () => import('./features/info/services/services.component').then(m => m.ServicesComponent) },
  { path: 'servicos/:id', loadComponent: () => import('./features/info/service-detail/service-detail.component').then(m => m.ServiceDetailComponent) },
  { path: 'galeria', loadComponent: () => import('./features/info/gallery/gallery.component').then(m => m.GalleryComponent) },
  { path: 'contato', loadComponent: () => import('./features/info/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'politicas', loadComponent: () => import('./features/info/policies/policies.component').then(m => m.PoliciesComponent) },
  { path: '**', redirectTo: '' }
];
