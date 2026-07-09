import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SeguimientoStoreService } from '../../services/seguimiento-store.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  store = inject(SeguimientoStoreService);
  auth = inject(AuthService);
  private router = inject(Router);

  salir(): void {
    this.auth.logout();
    this.router.navigate(['/seguimiento']);
  }
}
