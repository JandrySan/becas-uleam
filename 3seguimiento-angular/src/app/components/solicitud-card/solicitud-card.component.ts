import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EstadoSolicitud, SolicitudBeca } from '../../models/beca.model';

@Component({
  selector: 'app-solicitud-card',
  standalone: true,
  templateUrl: './solicitud-card.component.html'
})
export class SolicitudCardComponent {
  @Input({ required: true }) solicitud!: SolicitudBeca;
  @Input() modo: 'estudiante' | 'admin' = 'estudiante';
  @Input() estados: EstadoSolicitud[] = [];
  @Output() verDetalle = new EventEmitter<number>();
  @Output() estadoCambiado = new EventEmitter<{ id: number; estado: EstadoSolicitud }>();
}
