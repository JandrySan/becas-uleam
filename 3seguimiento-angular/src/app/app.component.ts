import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { SeguimientoStoreService } from './services/seguimiento-store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);
  private store = inject(SeguimientoStoreService);

  ngOnInit(): void {
    window.parent?.postMessage({ tipo: 'BECAS_ANGULAR_READY' }, '*');
  }

  @HostListener('window:message', ['$event'])
  recibirEstadoPortal(event: MessageEvent): void {
    const data = event.data || {};
    if (data.tipo === 'BECAS_PORTAL_STATE') {
      this.auth.aplicarSesion(data.session);
      this.store.actualizarDesdePortal();
    }
    if (data.tipo === 'BECAS_POSTULACION_ENVIADA' || data.tipo === 'BECAS_POSTULACION_UPDATE') {
      this.store.actualizarDesdePortal();
    }
  }
}
