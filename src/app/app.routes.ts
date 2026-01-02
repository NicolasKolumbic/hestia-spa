import { Routes } from '@angular/router';

// Guards (Debes crearlos luego para proteger la parte privada)
// import { authGuard } from './core/guards/auth.guard';
// import { publicGuard } from './core/guards/public.guard';

export const routes: Routes = [
    // =========================================================
    // 1. ENTORNO PÚBLICO (Web Institucional & Landing)
    // =========================================================
    {
        path: '',
        loadComponent: () => import('./features/public/home/home').then(m => m.Home),
        title: 'Hestia - Tu mundo conectado'
    },
    {
        path: 'soluciones',
        loadComponent: () => import('./features/public/solutions/solutions').then(m => m.Solutions),
        title: 'Hestia - Soluciones'
    },
    {
        path: 'tecnologia',
        loadComponent: () => import('./features/public/technology/technology').then(m => m.Technology),
        title: 'Hestia - Nuestra Tecnología'
    },
    {
        path: 'recursos', // Blog
        loadComponent: () => import('./features/public/blog/blog').then(m => m.Blog),
        title: 'Hestia - Recursos y Novedades'
    },
    {
        path: 'contacto',
        loadComponent: () => import('./features/public/contact/contact').then(m => m.Contact),
        title: 'Hestia - Contacto'
    },

    // =========================================================
    // 2. AUTENTICACIÓN (Login, Registro, Recuperación)
    // =========================================================
    {
        path: 'auth',
        // canActivate: [publicGuard], // Evita que usuarios logueados entren aquí
        loadComponent: () => import('./features/auth/auth-base/auth-base').then(m => m.AuthBase),
        children: [
            {
                path: 'login',
                loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
                title: 'Ingresar a Hestia'
            },
            {
                path: 'registro',
                loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
                title: 'Crear cuenta'
            },
            {
                path: 'recuperar',
                loadComponent: () => import('./features/auth/recovery/recovery').then(m => m.Recovery),
                title: 'Recuperar Contraseña'
            },
            {
                path: 'verificacion-2fa',
                loadComponent: () => import('./features/auth/two-factor/two-factor').then(m => m.TwoFactor),
                title: 'Verificación de Seguridad'
            },
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
    },

    // =========================================================
    // 3. ENTORNO PRIVADO (Web App / Dashboard)
    // =========================================================
    {
        path: 'app',
        // canActivate: [authGuard], // Protege toda esta sección
        // Cargamos un LAYOUT que contiene el Sidebar y Header fijos
        loadComponent: () => import('./layout/dashboard-layout/dashboard-layout').then(m => m.DashboardLayout),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/private/dashboard/dashboard').then(m => m.Dashboard),
                title: 'Hestia - Panel Principal'
            },

            // --- 📍 Mis Espacios (Rooms) ---
            {
                path: 'espacios',
                loadComponent: () => import('./features/private/spaces/spaces-list/spaces-list').then(m => m.SpacesList),
                title: 'Mis Espacios'
            },
            {
                path: 'espacios/:id', // Detalle de una habitación específica
                loadComponent: () => import('./features/private/spaces/space-detail/space-detail').then(m => m.SpaceDetail)
            },

            // --- 💡 Dispositivos (Por categoría) ---
            {
                path: 'dispositivos',
                children: [
                    { path: '', loadComponent: () => import('./features/private/devices/devices-overview/devices-overview').then(m => m.DevicesOverview) },
                    { path: 'iluminacion', loadComponent: () => import('./features/private/devices/lighting/lighting').then(m => m.Lighting) },
                    { path: 'clima', loadComponent: () => import('./features/private/devices/climate/climate').then(m => m.Climate) },
                    { path: 'seguridad', loadComponent: () => import('./features/private/devices/security/security').then(m => m.Security) },
                    { path: 'energia', loadComponent: () => import('./features/private/devices/energy/energy').then(m => m.Energy) }
                ]
            },

            // --- ⚡ Automatización ---
            {
                path: 'automatizacion',
                loadComponent: () => import('./features/private/automation/automation').then(m => m.Automation),
                title: 'Automatizaciones y Rutinas'
            },

            // --- 📊 Analítica ---
            {
                path: 'analitica',
                loadComponent: () => import('./features/private/analytics/analytics').then(m => m.Analytics),
                title: 'Reportes de Consumo'
            },

            // --- ⚙️ Configuración ---
            {
                path: 'configuracion',
                loadComponent: () => import('./features/private/settings/settings').then(m => m.Settings),
                title: 'Configuración del Sistema'
            },

            // Redirección por defecto dentro de la app
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    // =========================================================
    // 4. MANEJO DE ERRORES (404)
    // =========================================================
    {
        path: '**',
        loadComponent: () => import('./features/public/not-found/not-found').then(m => m.NotFound),
        title: 'Página no encontrada'
    }
];