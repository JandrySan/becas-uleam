import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { SolicitudesListaComponent } from './app/pages/solicitudes-lista/solicitudes-lista.component';
import { SolicitudDetalleComponent } from './app/pages/solicitud-detalle/solicitud-detalle.component';

const routes: Routes = [
  { path: '', redirectTo: 'seguimiento', pathMatch: 'full' },
  { path: 'seguimiento', component: SolicitudesListaComponent },
  { path: 'seguimiento/:id', component: SolicitudDetalleComponent },
  { path: '**', redirectTo: 'seguimiento' }
];

bootstrapApplication(AppComponent, { providers: [provideRouter(routes)] }).catch((err) => console.error(err));
