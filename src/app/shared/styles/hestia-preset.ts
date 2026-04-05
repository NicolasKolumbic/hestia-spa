import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const HestiaPreset = definePreset(Aura, {
    semantic: {
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

        colorScheme: {
            light: {
                surface: {
                    0: '#ffffff',
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                    950: '#030712'
                },
                primary: {
                    color: '{primary.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.600}',
                    activeColor: '{primary.700}'
                },
                formField: {
                    background: '{surface.0}',
                    borderColor: '{surface.300}',
                    color: '{surface.900}',
                    focusBorderColor: '{primary.500}'
                },
                text: {
                    color: '{surface.700}',
                    mutedColor: '{surface.500}'
                }
            },
            dark: {
                surface: {
                    0: '#ffffff', 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
                    300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569',
                    700: '#334155', 800: '#1E293B', 900: '#0F172A', 950: '#020617'
                },
                primary: {
                    color: '{primary.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.400}',
                    activeColor: '{primary.600}'
                },
                highlight: {
                    background: 'rgba(240, 100, 40, 0.16)',
                    focusBackground: 'rgba(240, 100, 40, 0.24)',
                    color: '{primary.400}',
                    focusColor: '{primary.300}'
                }
            }
        }
    }
});