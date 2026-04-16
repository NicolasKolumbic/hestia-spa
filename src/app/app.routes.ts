import { Routes } from '@angular/router';

// Guards (Debes crearlos luego para proteger la parte privada)
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';

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
        path: 'solutions',
        loadComponent: () => import('./features/public/solutions/solutions').then(m => m.Solutions),
        title: 'Hestia - Soluciones'
    },
    {
        path: 'features',
        loadComponent: () => import('./features/public/features/features').then(m => m.Features),
        title: 'Hestia - Caracteristicas'
    },
    {
        path: 'security',
        loadComponent: () => import('./features/public/security/security').then(m => m.Security),
        title: 'Hestia - Seguridad'
    },
    {
        path: 'technology',
        loadComponent: () => import('./features/public/technology/technology').then(m => m.Technology),
        title: 'Hestia - Nuestra Tecnología'
    },
    {
        path: 'resources', // Blog
        loadComponent: () => import('./features/public/blog/blog').then(m => m.Blog),
        title: 'Hestia - Recursos y Novedades'
    },
    {
        path: 'contact',
        loadComponent: () => import('./features/public/contact/contact').then(m => m.Contact),
        title: 'Hestia - Contacto'
    },
    {
        path: 'how-it-works',
        loadComponent: () => import('./features/public/how-it-works/how-it-works').then(m => m.HowItWorks),
        title: 'Hestia - Cómo funciona'
    },
    {
        path: 'blog',
        loadComponent: () => import('./features/public/blog/blog').then(m => m.Blog),
        title: 'Hestia - Blog'
    },
    {
        path: 'about-us',
        loadComponent: () => import('./features/public/about-us/about-us').then(m => m.AboutUs),
        title: 'Hestia - Acerca de nosotros'
    },
    {
        path: 'careers',
        loadComponent: () => import('./features/public/careers/careers').then(m => m.Careers),
        title: 'Hestia - Carreras'
    },

    // =========================================================
    // 2. AUTENTICACIÓN (Login, Registro, Recuperación)
    // =========================================================
    {
        path: 'auth',
        canActivate: [publicGuard], // Evita que usuarios logueados entren aquí
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
        path: 'platform',
        canActivate: [authGuard], // Protege toda esta sección
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
            {
                path: 'access-managment',
                loadComponent: () => import('./features/private/access-managment/access-managment').then(m => m.AccessManagment),
                title: 'Gestión de accesos'
            },
            {
                path: 'clients-managment',
                loadComponent: () => import('./features/private/client-managment/client-managment').then(m => m.ClientManagment),
                title: 'Gestión de clientes'
            },
            {
                path: 'clients-locations',
                loadComponent: () => import('./features/private/client-locations/client-locations').then(m => m.ClientLocations),
                title: 'Gestión de sitios'
            },

            // Redirección por defecto dentro de la app
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
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