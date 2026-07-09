import { Injectable, computed, signal } from '@angular/core';

export type RolUsuario = 'estudiante' | 'administrador';
export interface UsuarioSesion { rol: RolUsuario; nombre: string; correo?: string; estudianteId?: number; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuarioSignal = signal<UsuarioSesion | null>(this.leerSesion());
  usuario = this.usuarioSignal.asReadonly();
  estaAutenticado = computed(() => this.usuarioSignal() !== null);
  esAdmin = computed(() => this.usuarioSignal()?.rol === 'administrador');

  private leerSesion(): UsuarioSesion | null {
    try { const sesion = JSON.parse(localStorage.getItem('becas_session') || 'null'); return sesion?.rol ? sesion : null; } catch { return null; }
  }
  aplicarSesion(sesion: UsuarioSesion | null): void {
    if (!sesion?.rol) return;
    const normalizada: UsuarioSesion = { ...sesion, estudianteId: sesion.rol === 'estudiante' ? (sesion.estudianteId ?? 1) : undefined };
    localStorage.setItem('becas_session', JSON.stringify(normalizada));
    this.usuarioSignal.set(normalizada);
  }
  refrescarSesion(): void { this.usuarioSignal.set(this.leerSesion()); }
  logout(): void { localStorage.removeItem('becas_session'); this.usuarioSignal.set(null); }
}
