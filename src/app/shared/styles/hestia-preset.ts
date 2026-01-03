import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const HestiaPreset = definePreset(Aura, {
    semantic: {
        // --- 1. CONFIGURACIÓN GLOBAL ---
        transitionDuration: '0.2s',
        disabledOpacity: '0.6',
        iconSize: '1rem',
        anchorGutter: '0',

        // Anillo de Foco (Accesibilidad y Estilo Hestia)
        focusRing: {
            width: '2px',
            style: 'solid',
            color: '{primary.500}', // Anillo NARANJA al hacer foco con teclado/click
            offset: '2px',
            shadow: 'none'
        },

        // --- 2. PALETA DE MARCA (Naranja Hestia) ---
        primary: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#F06428', // COLOR PRINCIPAL
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
            950: '#431407'
        },

        // --- 3. DEFINICIÓN DE COMPONENTES SEMÁNTICOS ---

        // INPUTS (Textos, Dropdowns, Checkboxes)
        formField: {
            paddingX: '0.75rem',
            paddingY: '0.75rem',
            borderRadius: '0.75rem', // Bordes redondeados modernos
            transitionDuration: '0.2s',

            // Foco específico del input
            focusRing: {
                width: '0px', // Dejamos que el borde cambie de color en lugar de un anillo externo doble
                color: '{primary.500}',
                offset: '0',
                shadow: '0 0 0 1px {primary.500}' // Sombra interna naranja sutil
            },


            // Tamaños (sm y lg)
            sm: { fontSize: '0.875rem', paddingX: '0.625rem', paddingY: '0.625rem' },
            lg: { fontSize: '1.125rem', paddingX: '0.875rem', paddingY: '0.875rem' }
        },

        // LISTAS (Menús desplegables, Selects)
        list: {
            padding: '0.25rem',
            gap: '2px',
            header: { padding: '0.5rem 0.75rem' },
            option: { padding: '0.5rem 0.75rem', borderRadius: '0.375rem' },
            optionGroup: { padding: '0.5rem 0.75rem', fontWeight: '600' }
        },

        // CONTENIDO GENERAL (Paneles, Cards)
        content: {
            borderRadius: '0.75rem' // Tarjetas un poco más redondeadas
        },

        // MENÚS DE NAVEGACIÓN
        navigation: {
            list: { padding: '0.5rem', gap: '0.25rem' },
            item: { padding: '0.5rem 0.75rem', borderRadius: '0.375rem', gap: '0.5rem' },
            submenuLabel: { padding: '0.5rem 0.75rem', fontWeight: '600' },
            submenuIcon: { size: '0.875rem' }
        },

        // OVERLAYS (Popups, Modales, Tooltips)
        overlay: {
            select: { borderRadius: '0.5rem', shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15)' },
            popover: { borderRadius: '0.5rem', padding: '0.75rem', shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' },
            modal: { borderRadius: '1rem', padding: '1.5rem', shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }, // Sombra profunda para modales
            navigation: { shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }
        },

        // --- 4. ESQUEMAS DE COLOR (LIGHT / DARK) ---
        colorScheme: {
            dark: {
                surface: {
                    0: '#ffffff',
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                    950: '#020617'
                },

                // --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE ---
                primary: {
                    color: '{primary.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.400}',
                    activeColor: '{primary.600}'
                },

                highlight: {
                    background: 'rgba(240, 100, 40, 0.16)', // Fondo visiblemente naranja (transparente)
                    focusBackground: 'rgba(240, 100, 40, 0.24)',
                    color: '{primary.400}', // Texto naranja
                    focusColor: '{primary.300}'
                },
                // ---------------------------------------

                formField: {
                    background: '{surface.950}',
                    disabledBackground: '{surface.900}',
                    filledBackground: '{surface.900}',
                    filledHoverBackground: '{surface.800}',
                    filledFocusBackground: '{surface.900}',
                    borderColor: '{surface.700}',
                    hoverBorderColor: '{surface.600}',
                    focusBorderColor: '{primary.500}', // Borde Naranja Fuerte
                    invalidBorderColor: '#ef4444',
                    color: '{surface.0}',
                    placeholderColor: '{surface.500}',
                    floatLabelColor: '{surface.500}',
                    floatLabelFocusColor: '{primary.500}', // Label flotante se pone naranja
                    floatLabelActiveColor: '{primary.500}',
                    iconColor: '{surface.400}',
                    shadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'
                },

                text: {
                    color: '{surface.50}',
                    hoverColor: '#ffffff',
                    mutedColor: '{surface.400}',
                    hoverMutedColor: '{surface.300}'
                },

                content: {
                    background: '{surface.800}',
                    hoverBackground: '{surface.700}', // Un poco más claro al hover
                    borderColor: '{surface.700}',
                    color: '{text.color}'
                },

                overlay: {
                    select: { background: '{surface.800}', borderColor: '{surface.700}', color: '{text.color}' },
                    popover: { background: '{surface.800}', borderColor: '{surface.700}', color: '{text.color}' },
                    modal: { background: '{surface.800}', borderColor: '{surface.700}', color: '{text.color}' }
                },

                list: {
                    option: {
                        focusBackground: '{surface.700}',
                        // Usamos la variable highlight para consistencia
                        selectedBackground: '{highlight.background}',
                        selectedFocusBackground: '{highlight.focusBackground}',
                        color: '{text.color}',
                        focusColor: '#ffffff',
                        selectedColor: '{highlight.color}',
                        selectedFocusColor: '{highlight.focusColor}'
                    },
                    optionGroup: {
                        background: 'transparent',
                        color: '{text.mutedColor}'
                    }
                },

                navigation: {
                    item: {
                        focusBackground: '{surface.700}',
                        activeBackground: '{highlight.background}', // Menú activo naranja
                        color: '{text.color}',
                        focusColor: '#ffffff',
                        activeColor: '{highlight.color}' // Texto activo naranja
                    },
                    submenuLabel: {
                        background: 'transparent',
                        color: '{text.mutedColor}'
                    },
                    submenuIcon: {
                        color: '{text.mutedColor}',
                        focusColor: '{text.color}',
                        activeColor: '{highlight.color}' // Icono de submenú activo naranja
                    }
                }
            }
        }
    },
    components: {
        menu: {
            colorScheme: {
                dark: {
                    root: {
                        background: '{surface.800}',
                        color: '{surface.300}',
                        borderColor: '{surface.700}'
                    },
                    submenuLabel: {
                        color: '{surface.500}'
                    },
                    separator: {
                        borderColor: '{surface.700}'
                    },
                    item: {
                        focusBackground: '{surface.700}',
                        focusColor: '{surface.0}',
                    }

                },
                light: {
                    root: {
                        background: '{surface.0}',
                        color: '{surface-700}',
                        borderColor: '{surface.200}'
                    },
                    submenuLabel: {
                        color: '{surface.400}'
                    },
                    separator: {
                        borderColor: '{surface.200}'
                    },
                    item: {
                        focusBackground: '{surface.100}',
                        focusColor: '{slate-900}',
                    }
                }
            }

        },
        floatlabel: {
            colorScheme: {
                dark: {
                    on: {
                        active: {
                            background: '{surface.900}',
                        },
                    }
                },
                light: {
                    on: {
                        active: { background: '{surface.900}' },
                    }
                }
            }
        }
    }
});