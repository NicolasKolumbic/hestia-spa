/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'media',
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                'brand': {
                    500: '#F06428',
                }
            }
        },
    },
    plugins: [
        require('tailwindcss-primeui')
    ],
}