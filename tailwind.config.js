import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'net-blue': '#4070ad',   // Warna 1 (Atas)
                'net-teal': '#45b0ac',   // Warna 2
                'net-lime': '#9ce08b',   // Warna 3
                'net-yellow': '#fdfd96', // Warna 4 (Bawah)
            }
        },
    },

    plugins: [
        forms,
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
};
