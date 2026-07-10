import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
function copyModule(fromCandidates, target) {
  const from = fromCandidates.find(existsSync);
  if (!from) throw new Error(`No se encontró build para ${target}`);
  const dest = join(dist, target);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  cpSync(from, dest, { recursive: true });
}
copyModule([join(root, '1verificador-vue', 'dist')], 'vue');
copyModule([join(root, '2postulacion-react', 'dist')], 'react');
copyModule([
  join(root, '3seguimiento-angular', 'dist', 'seguimiento-solicitud-angular', 'browser'),
  join(root, '3seguimiento-angular', 'dist', 'seguimiento-solicitud-angular')
], 'angular');
console.log('dist integrado listo: /, /vue/, /react/, /angular/');
