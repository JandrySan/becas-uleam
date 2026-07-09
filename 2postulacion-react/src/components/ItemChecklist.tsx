import type { DocumentoRequerido } from '../types/documento';

interface ItemChecklistProps {
  requisito: DocumentoRequerido;
  cargado: boolean;
}

export default function ItemChecklist({ requisito, cargado }: ItemChecklistProps) {
  return (
    <div className={cargado ? 'item-completo' : 'item-incompleto'} data-file={requisito.id}>
      <span className="checklist-icon">{cargado ? '✅' : '⬜'}</span>
      <span className="checklist-label">{requisito.label}</span>
    </div>
  );
}
