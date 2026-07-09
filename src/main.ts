import { supabase } from './services/supabase';

type Sesion = {
  rol: 'estudiante' | 'administrador';
  nombre: string;
  correo: string;
};

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const buttons = [...document.querySelectorAll<HTMLButtonElement>('.tabs button')];
const frame = $('moduleFrame') as HTMLIFrameElement;
const title = $('title');
const tech = $('tech');
const open = $('open') as HTMLAnchorElement;
const tabs = $('tabs');
const loginPanel = $('loginPanel');
const appPanel = $('appPanel');
const flowBar = $('flowBar');
const userbox = $('userbox');
const sessionName = $('sessionName');
const loginStatus = $('loginStatus');

if (location.hostname === 'localhost' && location.port === '3000') {
  const devUrls = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:4200/#/seguimiento'
  ];

  buttons.forEach((btn, i) => {
    btn.dataset.src = devUrls[i];
  });
}

function setStatus(message: string, visible = true) {
  loginStatus.textContent = message;
  loginStatus.classList.toggle('hidden', !visible);
}

function limpiarDatosBecas() {
  ['token', 'usuario', 'supabase_user_id', 'becas_session'].forEach((key) => {
    localStorage.removeItem(key);
  });
}

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || '') as T;
  } catch {
    return fallback;
  }
}

function getSession() {
  return readJson<Sesion | null>('becas_session', null);
}

async function iniciarSesionSupabase(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.session || !data.user) {
    throw new Error('No se pudo iniciar sesión. Revise correo y contraseña.');
  }

  return {
    token: data.session.access_token,
    userId: data.user.id
  };
}

function sendState() {
  const payload = {
    tipo: 'BECAS_PORTAL_STATE',
    session: getSession(),
    token: localStorage.getItem('token'),
    usuario: localStorage.getItem('usuario'),
    userId: localStorage.getItem('supabase_user_id')
  };

  frame.contentWindow?.postMessage(payload, '*');
}

function activate(btn: HTMLButtonElement) {
  buttons.forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');

  frame.src = btn.dataset.src || '/';
  open.href = btn.dataset.src || '/';
  title.textContent = btn.dataset.title || '';
  tech.textContent = btn.dataset.tech || '';

  setTimeout(sendState, 800);
}

function activateBySrc(src: string) {
  const btn = buttons.find((b) => (b.dataset.src || '').startsWith(src));
  if (btn && !btn.disabled) activate(btn);
}

function showApp(session: Sesion) {
  loginPanel.classList.add('hidden');
  appPanel.classList.remove('hidden');
  flowBar.classList.remove('hidden');
  userbox.classList.remove('hidden');
  tabs.classList.remove('hidden');

  sessionName.textContent = `${session.nombre} · ${session.rol}`;

  if (session.rol === 'administrador') {
    buttons.forEach((b, i) => {
      b.disabled = i < 2;
    });
    activate(buttons[2]);
  } else {
    buttons.forEach((b) => {
      b.disabled = false;
    });
    activate(buttons[0]);
  }
}

function saveSession(session: Sesion, token: string, userId?: string) {
  limpiarDatosBecas();

  localStorage.setItem('token', token);
  localStorage.setItem('usuario', session.correo);
  localStorage.setItem('becas_session', JSON.stringify(session));

  if (userId) {
    localStorage.setItem('supabase_user_id', userId);
  }

  showApp(session);
}

$('loginBtn').addEventListener('click', async () => {
  const correo = ($('loginEmail') as HTMLInputElement).value.trim();
  const password = ($('loginPassword') as HTMLInputElement).value;

  if (!correo || !password) {
    setStatus('Ingrese correo y contraseña.');
    return;
  }

  try {
    setStatus('Iniciando sesión...');

    const auth = await iniciarSesionSupabase(correo, password);

    const esAdmin = correo.includes('admin');

    const session: Sesion = {
      rol: esAdmin ? 'administrador' : 'estudiante',
      nombre: esAdmin ? 'Administrador Bienestar Estudiantil' : 'Estudiante ULEAM',
      correo
    };

    saveSession(session, auth.token, auth.userId);
  } catch (err) {
    setStatus((err as Error).message);
  }
});

$('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  limpiarDatosBecas();
  location.reload();
});

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!btn.disabled) activate(btn);
  });
});

frame.addEventListener('load', () => setTimeout(sendState, 350));

window.addEventListener('message', (event) => {
  const data = event.data || {};

  if (data.modulo === 'postulacion') activateBySrc('/react/');
  if (data.modulo === 'seguimiento') activateBySrc('/angular/');

  if (
    data.tipo === 'BECAS_REACT_READY' ||
    data.tipo === 'BECAS_ANGULAR_READY' ||
    data.tipo === 'BECAS_VUE_READY'
  ) {
    sendState();
  }
});

const session = getSession();

if (session && localStorage.getItem('token')) {
  showApp(session);
}