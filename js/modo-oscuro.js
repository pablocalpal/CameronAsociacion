document.addEventListener('DOMContentLoaded', () => {

    const toggleButton = document.getElementById('icono-modo-oscuro');

    toggleButton.addEventListener('click', () => {
        const htmlElement = document.documentElement;
        const currentTheme = htmlElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        htmlElement.setAttribute('data-bs-theme', newTheme);

        // Comprueba el estado despues de cambiarlo y reemplaza el icono
        if (newTheme === 'dark') {
            toggleButton.innerHTML = '<i data-feather="sun"></i>';
            toggleButton.setAttribute('aria-label', 'Activar modo claro');
        } else {
            toggleButton.innerHTML = '<i data-feather="moon"></i>';
            toggleButton.setAttribute('aria-label', 'Activar modo oscuro');
        }

        // Vuelve a cargar los iconos de Feather
        feather.replace();
    });
});