tailwind.config = {
    theme: {
        extend: {
            colors: {
                tramaBlue: {
                    light: '#8BB7E5',
                    DEFAULT: '#68A0D6',
                    dark: '#4B82BA',
                    navy: '#1A2938'
                },
                tramaGold: {
                    light: '#F8CE5D',
                    DEFAULT: '#F4B41A',
                    dark: '#D99B05'
                },
                tramaGray: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    600: '#708090',
                    800: '#1E293B'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        }
    }
};

// Current Interactive Role State ('superadmin', 'admin', 'employee')
let currentRole = 'admin';

// Roles Configuration & Mock Users
const roleProfiles = {
    superadmin: {
        name: "Gonzalo Trama",
        title: "SuperAdmin / TRAMA HQ",
        avatar: "HQ",
        orgName: "RED MULTIEMPRESA TRAMA",
        orgMeta: "Control de Licencias & Certificación",
        contextLabel: "PANEL HQ MULTITENANT"
    },
    admin: {
        name: "Juan Pérez",
        title: "Director General (DG)",
        avatar: "JP",
        orgName: "BELLINZONA S.R.L.",
        orgMeta: "CUIT: 30-71100900-5 | ISO 9001",
        contextLabel: "ORGANIZACIÓN SELECCIONADA"
    },
    employee: {
        name: "Federico Baranchini",
        title: "Inspector Senior de Fosa",
        avatar: "FB",
        orgName: "BELLINZONA S.R.L.",
        orgMeta: "Planta Chascomús | Fosa 01",
        contextLabel: "LUGAR DE TRABAJO"
    }
};

// Switch Roles Live System
function setRole(roleKey) {
    currentRole = roleKey;
    const profile = roleProfiles[roleKey];

    // Update UI User Cards
    document.getElementById('userName').innerText = profile.name;
    document.getElementById('userRoleTitle').innerText = profile.title;
    document.getElementById('userAvatar').innerText = profile.avatar;
    document.getElementById('sidebarOrgName').innerText = profile.orgName;
    document.getElementById('sidebarOrgMeta').innerText = profile.orgMeta;
    document.getElementById('sidebarContextLabel').innerText = profile.contextLabel;

    // Highlight Active Role Button
    ['superadmin', 'admin', 'employee'].forEach(r => {
        const btn = document.getElementById(`roleBtn-${r}`);
        if (r === roleKey) {
            btn.className = "px-2.5 py-1 rounded-lg font-bold transition bg-white text-tramaBlue-navy shadow-sm border border-slate-200";
        } else {
            btn.className = "px-2.5 py-1 rounded-lg font-bold transition text-slate-600 hover:text-slate-900";
        }
    });

    // Toggle Role Specific Menu Items
    const superAdminNav = document.getElementById('nav-superadmin');
    const adminNavs = document.querySelectorAll('.admin-or-sa');

    if (roleKey === 'superadmin') {
        superAdminNav.classList.remove('hidden');
        adminNavs.forEach(el => el.classList.remove('hidden'));
        switchTab('superadmin', superAdminNav);
        triggerToast('Modo SuperAdmin Activado - TRAMA HQ', 'purple');
    } else if (roleKey === 'admin') {
        superAdminNav.classList.add('hidden');
        adminNavs.forEach(el => el.classList.remove('hidden'));
        switchTab('dashboard', document.getElementById('nav-dashboard'));
        triggerToast('Vista de Admin Empresa - Bellinzona S.R.L.', 'info');
    } else if (roleKey === 'employee') {
        superAdminNav.classList.add('hidden');
        adminNavs.forEach(el => el.classList.add('hidden'));
        switchTab('dashboard', document.getElementById('nav-dashboard'));
        triggerToast('Vista de Empleado Operativo Activada', 'warning');
    }
}

// Notification Toast System
function triggerToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const colorClasses = {
        info: 'bg-slate-900 text-white border-tramaBlue',
        success: 'bg-emerald-900 text-white border-emerald-400',
        warning: 'bg-amber-900 text-white border-amber-400',
        purple: 'bg-purple-950 text-white border-purple-400'
    };

    const iconClasses = {
        info: 'fa-circle-info text-tramaBlue',
        success: 'fa-circle-check text-emerald-400',
        warning: 'fa-bell text-amber-400',
        purple: 'fa-crown text-tramaGold'
    };

    toast.className = `${colorClasses[type] || colorClasses.info} border-l-4 p-3 rounded-xl shadow-2xl text-xs flex items-center justify-between pointer-events-auto animate-slide-in`;
    toast.innerHTML = `
        <div class="flex items-center space-x-2.5">
            <i class="fa-solid ${iconClasses[type] || iconClasses.info} text-sm"></i>
            <span class="font-medium">${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white ml-3"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 4000);
}

// Task Reminder Dispatcher (SuperAdmin / Admin to Employee)
function sendTaskReminder(employeeName, taskTitle) {
    triggerToast(`Notificación enviada a ${employeeName}: "${taskTitle}"`, 'warning');
}

function broadcastAllReminders() {
    triggerToast(`Alertas push masivas enviadas a todo el personal con tareas pendientes.`, 'purple');
}

// Database simulation for CUITALIZER ARCA API
const cuitDatabase = {
    "20341015015": {
        cuit: "20341015015",
        razonSocial: "FERNANDEZ DE LIGER JOSE HUGO",
        tipoPersona: "FISICA",
        estadoClave: "ACTIVO",
        domicilio: "MALVINAS ARGENTINAS 28",
        localidad: "CHASCOMUS (CP: 7130)",
        provincia: "BUENOS AIRES",
        actividad: "711009 - SERVICIOS DE ARQUITECTURA E INGENIERÍA Y SERVICIOS CONEXOS DE ASESORAMIENTO TÉCNICO N.C.P."
    },
    "30711009005": {
        cuit: "30711009005",
        razonSocial: "BELLINZONA S.R.L.",
        tipoPersona: "JURIDICA",
        estadoClave: "ACTIVO",
        domicilio: "RUTA NACIONAL 2 KM 114",
        localidad: "CHASCOMUS (CP: 7130)",
        provincia: "BUENOS AIRES",
        actividad: "712000 - ENSAYOS Y ANÁLISIS TÉCNICOS (RTO TÉCNICA VEHICULAR)"
    }
};

function consultarCUITALIZER() {
    const rawCuit = document.getElementById('cuitInput').value.replace(/\D/g, '');
    const data = cuitDatabase[rawCuit] || {
        cuit: rawCuit || "NO INGRESADO",
        razonSocial: "CONTRIBUYENTE CONSULTADO S.A.",
        tipoPersona: "JURIDICA",
        estadoClave: "ACTIVO (CONSULTA VÍA ARCA API)",
        domicilio: "AV. SAN MARTÍN 1050",
        localidad: "BUENOS AIRES (CP: 1000)",
        provincia: "BUENOS AIRES",
        actividad: "702000 - SERVICIOS DE GESTIÓN Y ASESORAMIENTO EMPRESARIAL"
    };

    document.getElementById('resRazonSocial').value = data.razonSocial;
    document.getElementById('resEstadoClave').value = `${data.tipoPersona} | Estado: ${data.estadoClave}`;
    document.getElementById('resDomicilio').value = data.domicilio;
    document.getElementById('resLocalidad').value = `${data.localidad}, ${data.provincia}`;
    document.getElementById('resActividad').value = data.actividad;

    const mockJsonResponse = {
        success: true,
        error: null,
        data: {
            cuit: data.cuit,
            razonSocial: data.razonSocial,
            tipoPersona: data.tipoPersona,
            estadoClave: data.estadoClave,
            domicilioFiscal: data.domicilio,
            localidad: data.localidad,
            provincia: data.provincia,
            actividadPrincipalDescripcion: data.actividad
        },
        cacheHit: true,
        creditsConsumed: 1
    };

    document.getElementById('jsonOutput').innerText = JSON.stringify(mockJsonResponse, null, 2);
}

function toggleSidebar(forceOpen) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileSidebarOverlay');
    const btn = document.getElementById('mobileMenuBtn');
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !sidebar.classList.contains('open');

    if (!sidebar || !overlay || !btn) return;

    sidebar.classList.toggle('open', shouldOpen);
    overlay.classList.toggle('visible', shouldOpen);
    overlay.classList.toggle('hidden', !shouldOpen);
    btn.setAttribute('aria-expanded', String(shouldOpen));
    document.body.classList.toggle('sidebar-open', shouldOpen);
}

const sidebarToggleButton = document.getElementById('mobileMenuBtn');
if (sidebarToggleButton) {
    sidebarToggleButton.addEventListener('click', () => toggleSidebar());
}

const sidebarOverlay = document.getElementById('mobileSidebarOverlay');
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => toggleSidebar(false));
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (window.innerWidth < 768) toggleSidebar(false);
    });
});

window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) toggleSidebar(false);
});

// Tab Navigation
function switchTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');

    if(element) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('bg-tramaBlue', 'bg-purple-600/90', 'text-white', 'shadow-md');
            btn.classList.add('text-slate-400');
        });
        if (tabId === 'superadmin') {
            element.classList.add('bg-purple-600/90', 'text-white', 'shadow-md');
        } else {
            element.classList.add('bg-tramaBlue', 'text-white', 'shadow-md');
        }
        element.classList.remove('text-slate-400');
    }

    const titles = {
        'superadmin': 'Panel Multiempresa & Control de Colaboradores (TRAMA HQ)',
        'dashboard': 'Tablero Principal de Gestión',
        'cuitalizer': 'Alta de CUIT Vía API CUITALIZER ARCA',
        'documentos': 'Gestión Documental & Trazabilidad BFA',
        'procesos': 'Ficha de Proceso (Estandarización Toyota)',
        'acciones': 'Acciones Correctivas & Mejora (7 Pasos)',
        'proveedores': 'Catálogo Estandarizado de Proveedores',
        'auditorias': 'Auditorías Internas (RG-15)',
        'riesgos': 'Matriz de Riesgos y Oportunidades (DOC-05)',
        'capitalHumano': 'Capital Humano & Polivalencia'
    };
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.innerText = titles[tabId] || 'Ecosistema TRAMA';
}

// Search Filter
function filterDocs() {
    const searchVal = document.getElementById('docSearch').value.toLowerCase();
    const tipoVal = document.getElementById('filterTipo').value;
    const procesoVal = document.getElementById('filterProceso').value;

    document.querySelectorAll('.doc-card').forEach(card => {
        const text = card.innerText.toLowerCase();
        const tipo = card.getAttribute('data-tipo');
        const proceso = card.getAttribute('data-proceso');

        const matchesSearch = text.includes(searchVal);
        const matchesTipo = !tipoVal || tipo === tipoVal;
        const matchesProceso = !procesoVal || proceso === procesoVal;

        card.style.display = (matchesSearch && matchesTipo && matchesProceso) ? 'flex' : 'none';
    });
}

// Modal PDF view
function viewDocPDF(code, title, rev, approver, date, hash) {
    document.getElementById('modalDocCode').innerText = code;
    document.getElementById('modalDocBodyTitle').innerText = title;
    document.getElementById('modalDocTitle').innerText = `${code} - ${title}`;
    document.getElementById('modalDocRev').innerText = `Revisión: ${rev}`;
    document.getElementById('modalDocApprover').innerText = approver;
    document.getElementById('modalDocDate').innerText = date;
    document.getElementById('modalDocHash').innerText = hash;

    document.getElementById('qrcode').innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
        text: "https://trama.app/verify/" + hash.substring(0, 16),
        width: 58,
        height: 58,
        colorDark: "#1a2938",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    document.getElementById('pdfModal').classList.remove('hidden');
}

function closePdfModal() {
    document.getElementById('pdfModal').classList.add('hidden');
}

function openAIModal() {
    document.getElementById('aiModal').classList.remove('hidden');
}

function closeAIModal() {
    document.getElementById('aiModal').classList.add('hidden');
}

function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const text = input.value.trim();
    if(!text) return;

    const chatBody = document.getElementById('chatBody');
    const userMsg = document.createElement('div');
    userMsg.className = "bg-tramaBlue text-white p-2.5 rounded-xl max-w-md ml-auto shadow-sm";
    userMsg.innerHTML = `<p>${text}</p>`;
    chatBody.appendChild(userMsg);

    input.value = "";
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.className = "bg-white p-2.5 rounded-xl border border-slate-200 max-w-md shadow-sm";
        aiMsg.innerHTML = `
            <p class="font-bold text-tramaBlue mb-1">TRAMA IA:</p>
            <p class="text-slate-700">Informe para Revisión por la Dirección preparado: 96.4% cumplimiento documental, 14 sellos BFA válidos, y 88.5% acciones cerradas en plazo.</p>
        `;
        chatBody.appendChild(aiMsg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 600);
}

function weatherCodeToLabel(code) {
    const mapping = {
        0: 'Despejado',
        1: 'Mayormente despejado',
        2: 'Parcialmente nublado',
        3: 'Nublado',
        45: 'Niebla',
        48: 'Niebla con escarcha',
        51: 'Llovizna ligera',
        53: 'Llovizna moderada',
        55: 'Llovizna fuerte',
        56: 'Llovizna helada',
        57: 'Llovizna helada intensa',
        61: 'Lluvia ligera',
        63: 'Lluvia moderada',
        65: 'Lluvia fuerte',
        66: 'Lluvia helada',
        67: 'Lluvia helada intensa',
        71: 'Nieve ligera',
        73: 'Nieve moderada',
        75: 'Nieve intensa',
        77: 'Granizo',
        80: 'Chubascos',
        81: 'Lluvia intensa',
        82: 'Lluvia torrencial',
        85: 'Nieve moderada',
        86: 'Nieve intensa',
        95: 'Tormenta',
        96: 'Tormenta con granizo',
        99: 'Tormenta severa'
    };

    return mapping[code] || 'Condición variable';
}

function updateWeatherDateTime() {
    const weatherDateTime = document.getElementById('weatherDateTime');
    if (!weatherDateTime) return;

    const now = new Date();
    const formatted = new Intl.DateTimeFormat('es-AR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    }).format(now).replace('.', '');

    weatherDateTime.textContent = formatted;
}

function weatherCodeToIcon(code) {
    if (code === 0 || code === 1) return '☀️';
    if (code === 2 || code === 3) return '⛅';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
    if ([95, 96, 99].includes(code)) return '⛈️';
    return '🌤️';
}

async function loadWeather() {
    const tempEl = document.getElementById('weatherTemp');
    const conditionEl = document.getElementById('weatherCondition');
    const humidityEl = document.getElementById('weatherHumidity');
    const windEl = document.getElementById('weatherWind');
    const iconEl = document.getElementById('weatherIcon');

    if (!tempEl || !conditionEl || !humidityEl || !windEl || !iconEl) return;

    updateWeatherDateTime();

    try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=-34.6037&longitude=-58.3816&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather API error');

        const data = await response.json();
        const current = data.current;
        const code = current.weather_code;

        tempEl.textContent = `${Math.round(current.temperature_2m)}°C`;
        conditionEl.textContent = weatherCodeToLabel(code);
        humidityEl.textContent = current.relative_humidity_2m;
        windEl.textContent = Math.round(current.wind_speed_10m * 3.6);
        iconEl.textContent = weatherCodeToIcon(code);
    } catch (error) {
        tempEl.textContent = '21°C';
        conditionEl.textContent = 'Clima no disponible';
        humidityEl.textContent = '55';
        windEl.textContent = '12';
        iconEl.textContent = '☀️';
    }
}

const weatherWidget = document.getElementById('weatherWidget');
if (weatherWidget) {
    let dragState = null;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const stopDragging = () => {
        dragState = null;
        weatherWidget.classList.remove('dragging');
    };

    weatherWidget.addEventListener('pointerdown', (event) => {
        dragState = {
            offsetX: event.clientX - weatherWidget.getBoundingClientRect().left,
            offsetY: event.clientY - weatherWidget.getBoundingClientRect().top
        };
        weatherWidget.classList.add('dragging');
        weatherWidget.setPointerCapture(event.pointerId);
    });

    weatherWidget.addEventListener('pointermove', (event) => {
        if (!dragState) return;

        const maxLeft = window.innerWidth - weatherWidget.offsetWidth - 12;
        const maxTop = window.innerHeight - weatherWidget.offsetHeight - 12;
        const nextLeft = clamp(event.clientX - dragState.offsetX, 8, Math.max(8, maxLeft));
        const nextTop = clamp(event.clientY - dragState.offsetY, 8, Math.max(8, maxTop));

        weatherWidget.style.left = `${nextLeft}px`;
        weatherWidget.style.top = `${nextTop}px`;
        weatherWidget.style.bottom = 'auto';
        event.preventDefault();
    });

    weatherWidget.addEventListener('pointerup', stopDragging);
    weatherWidget.addEventListener('pointerleave', stopDragging);
    weatherWidget.addEventListener('pointercancel', stopDragging);
}

// Initialize Charts & CUIT on load
window.onload = function() {
    consultarCUITALIZER();
    loadWeather();

    const ctx = document.getElementById('kpiChart');
    if (!ctx) return;

    new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [
                {
                    label: 'RTO Realizados',
                    data: [531, 472, 515, 433, 516, 479, 545, 460, 510, 540, 560, 590],
                    borderColor: '#68A0D6',
                    backgroundColor: 'rgba(104, 160, 214, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Meta Ideal (640)',
                    data: [640, 640, 640, 640, 640, 640, 640, 640, 640, 640, 640, 640],
                    borderColor: '#F4B41A',
                    borderDash: [4, 4],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { min: 350 } }
        }
    });
};

setInterval(() => {
    updateWeatherDateTime();
    loadWeather();
}, 60000);

(() => {
  const $ = id => document.getElementById(id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navFor = t => document.querySelector(`.nav-btn[onclick*="'${t}'"]`);
  const curRole = () => typeof currentRole !== 'undefined' ? currentRole : 'admin';
  const askAI = () => {
    openAIModal();
    const q = 'Preparame el informe para la Revisión por la Dirección', inp = $('aiInput'); let k = 0;
    inp.value = '';
    let typer = setInterval(() => {
      inp.value = q.slice(0, ++k);
      if (k >= q.length) {
        clearInterval(typer);
        setTimeout(() => sendAIMessage(), 500);
      }
    }, reduce ? 0 : 35);
  };

  const S = [
    { role:'admin', tab:'dashboard', sel:'#kpiChart', t:'Un tablero para toda la gestión ISO', d:'Documentos, acciones, proveedores y auditorías en un solo lugar, con indicadores claros para decidir.' },
    { role:'admin', tab:'cuitalizer', act:() => consultarCUITALIZER(), t:'Alta de empresa con solo el CUIT', d:'Se consulta ARCA y se completan razón social, domicilio y actividad, sin cargar datos a mano.' },
    { role:'admin', tab:'documentos', act:() => document.querySelector('#documentos [onclick^="viewDocPDF"]')?.click(), t:'Documentos con sello inmutable', d:'Cada versión aprobada queda anclada en la Blockchain Federal Argentina y se verifica con un QR.' },
    { role:'admin', tab:'procesos', t:'Cada proceso, en una ficha estandarizada', d:'Quién responde, qué entra, qué sale y cómo se mide, con el mismo formato en toda la empresa.' },
    { role:'admin', tab:'acciones', t:'Acciones correctivas en 7 pasos', d:'Del desvío al cierre, con responsables, plazos y avisos para que nada quede sin seguimiento.' },
    { role:'admin', tab:'proveedores', t:'Proveedores evaluados con un mismo criterio', d:'Un catálogo único para comparar y decidir con datos.' },
    { role:'admin', tab:'auditorias', t:'Auditorías internas sin planillas sueltas', d:'Planificá, ejecutá y seguí los hallazgos desde el mismo sistema.' },
    { role:'admin', tab:'riesgos', t:'Riesgos y oportunidades a la vista', d:'La matriz queda disponible para la dirección y lista para la auditoría externa.' },
    { role:'admin', tab:'capitalHumano', t:'Personas y polivalencia', d:'Quién sabe hacer qué y dónde falta cobertura.' },
    { role:'superadmin', tab:'superadmin', t:'Una vista central para toda la red', d:'Con perfil SuperAdmin se supervisan las empresas cliente, quién está conectado y qué tareas están vencidas.' },
    { role:'employee', tab:'dashboard', t:'Cada persona ve lo que le corresponde', d:'Menú reducido y tareas asignadas: el empleado entra y sabe qué hacer.' },
    { role:'admin', tab:'dashboard', act:askAI, t:'TRAMA IA arma el informe por vos', d:'Se le pide el informe para la Revisión por la Dirección y responde con los indicadores del sistema.' }
  ];

  let i = 0, on = false, auto = null, typer = null;

  function clearRings() {
    document.querySelectorAll('.tour-ring').forEach(e => e.classList.remove('tour-ring'));
  }

  function go(n) {
    i = Math.max(0, Math.min(S.length - 1, n));
    const s = S[i];
    clearInterval(typer);
    closePdfModal();
    closeAIModal();
    clearRings();
    if (curRole() !== s.role) setRole(s.role);
    const nav = navFor(s.tab);
    switchTab(s.tab, nav);
    nav && nav.classList.add('tour-ring');
    const main = document.querySelector('main');
    main.scrollTo(0, 0);
    const el = s.sel && document.querySelector(s.sel);
    if (el) {
      el.classList.add('tour-ring');
      el.scrollIntoView({ block:'center', behavior: reduce ? 'auto' : 'smooth' });
    }
    $('tourCount').textContent = `Paso ${i + 1} de ${S.length}`;
    $('tourTitle').textContent = s.t;
    $('tourText').textContent = s.d;
    $('tourBar').style.width = ((i + 1) / S.length * 100) + '%';
    $('tNext').textContent = i === S.length - 1 ? 'Finalizar' : 'Siguiente';
    $('tPrev').disabled = i === 0;
    s.act && setTimeout(() => { if (on && S[i] === s) s.act(); }, 500);
  }

  function next() {
    i === S.length - 1 ? exit(true) : go(i + 1);
  }

  function setAuto(v) {
    clearInterval(auto);
    $('tAuto').setAttribute('aria-pressed', v);
    if (v) auto = setInterval(() => i < S.length - 1 ? go(i + 1) : setAuto(false), 14000);
  }

  function start() {
    on = true;
    $('tour').hidden = false;
    document.querySelector('main').style.paddingBottom = '150px';
    go(0);
  }

  function exit(reset) {
    on = false;
    setAuto(false);
    clearInterval(typer);
    clearRings();
    $('tour').hidden = true;
    document.querySelector('main').style.paddingBottom = '';
    closePdfModal();
    closeAIModal();
    if (reset) {
      if (curRole() !== 'admin') setRole('admin');
      switchTab('dashboard', navFor('dashboard'));
    }
  }

  // Botón de inicio en el encabezado
  const aiBtn = document.querySelector('button[onclick="openAIModal()"]');
  const b = document.createElement('button');
  b.id = 'tourStart';
  b.className = 'bg-tramaGold text-tramaBlue-navy text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-tramaGold-light transition flex items-center space-x-2 shadow-sm';
  b.innerHTML = '<i class="fa-solid fa-play"></i><span>Iniciar recorrido</span>';
  b.onclick = start;
  aiBtn.parentNode.insertBefore(b, aiBtn);

  $('tNext').onclick = next;
  $('tPrev').onclick = () => go(i - 1);
  $('tExit').onclick = () => exit(false);
  $('tAuto').onclick = () => setAuto($('tAuto').getAttribute('aria-pressed') !== 'true');

  addEventListener('keydown', e => {
    if (!on || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      go(i - 1);
    } else if (e.key === 'Escape') {
      exit(false);
    } else if (e.key.toLowerCase() === 'f') {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
    }
  });

  // Los indicadores del tablero suben desde cero al entrar
  function countUp(root) {
    if (reduce) return;
    root.querySelectorAll('p.text-2xl').forEach(p => {
      if (p.dataset.v === undefined) p.dataset.v = p.textContent;
      const m = p.dataset.v.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
      if (!m) return;
      const end = parseFloat(m[2].replace(',', '.'));
      const dec = (m[2].split(/[.,]/)[1] || '').length;
      const sep = m[2].includes(',') ? ',' : '.';
      const t0 = performance.now();
      (function f(t) {
        const k = Math.min((t - t0) / 900, 1), e = 1 - Math.pow(1 - k, 3);
        p.textContent = k < 1 ? m[1] + (end * e).toFixed(dec).replace('.', sep) + m[3] : p.dataset.v;
        if (k < 1) requestAnimationFrame(f);
      })(t0);
    });
  }

  const origSwitch = window.switchTab;
  window.switchTab = function (id, el) {
    origSwitch(id, el);
    if (id === 'dashboard') countUp($('dashboard'));
  };

  addEventListener('load', () => setTimeout(() => countUp($('dashboard')), 300));
})();
