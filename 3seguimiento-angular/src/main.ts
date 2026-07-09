if (!localStorage.getItem('token') && window.location.pathname !== '/') {
  window.location.href = '/';
}

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes, CanActivateFn, Router, withHashLocation } from '@angular/router';
import { inject } from '@angular/core';
import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/pages/login/login.component';
import { SolicitudesListaComponent } from './app/pages/solicitudes-lista/solicitudes-lista.component';
import { SolicitudDetalleComponent } from './app/pages/solicitud-detalle/solicitud-detalle.component';
import { AuthService } from './app/services/auth.service';

const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return localStorage.getItem('token') || auth.estaAutenticado() ? true : router.createUrlTree(['/login']);
};

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'seguimiento', component: SolicitudesListaComponent, canActivate: [authGuard] },
  { path: 'seguimiento/:id', component: SolicitudDetalleComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes, withHashLocation())]
}).catch((err) => console.error(err));
