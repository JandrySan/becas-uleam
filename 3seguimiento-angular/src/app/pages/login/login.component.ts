import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, RolUsuario } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  ingresar(rol: RolUsuario): void {
    this.auth.aplicarSesion({
      rol,
      nombre: rol === 'administrador' ? 'Administrador Bienestar Estudiantil' : 'Estudiante ULEAM',
      estudianteId: rol === 'estudiante' ? 1 : undefined
    });
    this.router.navigate(['/seguimiento']);
  }
}
