import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SolicitudCardComponent } from '../../components/solicitud-card/solicitud-card.component';
import { EstadoSolicitud } from '../../models/beca.model';
import { SeguimientoStoreService } from '../../services/seguimiento-store.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-solicitudes-lista',
  standalone: true,
  imports: [FormsModule, SolicitudCardComponent],
  templateUrl: './solicitudes-lista.component.html'
})
export class SolicitudesListaComponent {
  store = inject(SeguimientoStoreService);
  auth = inject(AuthService);
  private router = inject(Router);
  estados: EstadoSolicitud[] = ['Recibida', 'En revisión', 'Aprobada', 'Rechazada', 'Corrección requerida'];

  solicitudesVisibles = computed(() => {
    const usuario = this.auth.usuario();
    if (!usuario) return [];
    if (usuario.rol === 'administrador') return this.store.solicitudesFiltradas();
    return this.store.solicitudesPorEstudiante(usuario.estudianteId ?? 0);
  });

  irDetalle(id: number): void {
    this.router.navigate(['/seguimiento', id]);
  }
}
