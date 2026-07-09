import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeguimientoStoreService } from '../../services/seguimiento-store.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-solicitud-detalle',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './solicitud-detalle.component.html'
})
export class SolicitudDetalleComponent {
  store = inject(SeguimientoStoreService);
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private id = Number(this.route.snapshot.paramMap.get('id'));

  solicitud = computed(() => {
    const encontrada = this.store.buscarPorId(this.id);
    const usuario = this.auth.usuario();
    if (!encontrada || !usuario) return undefined;
    return usuario.rol === 'administrador' || encontrada.estudiante.id === usuario.estudianteId ? encontrada : undefined;
  });
}
