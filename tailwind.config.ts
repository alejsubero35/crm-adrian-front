
import type { Config } from "tailwindcss";
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
	// Revertido theme: sin personalizador dinámico; mantenemos configuración por defecto (sin definir darkMode explícito)
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: [
					"Nunito Sans",
					"Public Sans",
					"Public Sans Fallback",
					"Inter",
					"ui-sans-serif",
					"system-ui",
					"Segoe UI",
					"Roboto",
					"Helvetica",
					"Arial",
					"Noto Sans",
					"Apple Color Emoji",
					"Segoe UI Emoji",
					"Segoe UI Symbol"
				],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				// Force ring/focus to brand orange by default
				ring: '#f4bf97',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				// Brand palette (inspired by supplied image: blue -> cyan -> orange)
				primary: {
					DEFAULT: '#0B5FFF', // deep brand blue
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#FF7A1A', // vibrant orange
					foreground: '#FFFFFF'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				// Use brand orange as global accent
				accent: {
					DEFAULT: '#FF7A1A',
					foreground: '#FFFFFF'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// legacy specific tokens mapped to new brand colors (purple tokens remapped to orange)
				'blue-primary': '#1B91BF',
				'blue-secondary': '#00C7FF',
				'gray-dark': '#333333',
				'gray-medium': '#4A4A4A',
				'gray-light': '#F0F0F0',
				'success-green': '#28A745',
				'brand-orange': '#e8761e',
				'brand-orange-2': '#FFB047',
				'brand-yellow': '#FFD166',
				'brand-cyan': '#00C7FF',
				'purple-primary': '#f4bf97',
				'purple-secondary': '#FF7A1A',
				'purple-dark': '#cc5f0f',
				'purple-light': '#FFD5B3',
				'soft-green': '#F2FCE2',
				'soft-yellow': '#FEF7CD',
				'soft-orange': '#FEC6A1',
				'soft-purple': '#FFE8D6',
				'soft-pink': '#FFDEE2',
				'soft-blue': '#D3E4FD',
				'soft-gray': '#F1F0FB',
			},
			// Revertido: radios estáticos en lugar de variables configurables
			borderRadius: {
				lg: '0.5rem',
				md: '0.375rem',
				sm: '0.25rem'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
