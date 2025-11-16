document.addEventListener('DOMContentLoaded', () => {

    const toggleButton = document.getElementById('icono-modo-oscuro');

    toggleButton.addEventListener('click', () => {

        document.body.classList.toggle('dark-mode');
        
        // Comprueba el estado despues de cambiarlo y reemplaza el icono
        if (document.body.classList.contains('dark-mode')) {
            toggleButton.innerHTML = '<i data-feather="sun"></i>';
        } else {
            toggleButton.innerHTML = '<i data-feather="moon"></i>';
        }

        // Vuelve a cargar los iconos de Feather
        feather.replace();
    });
});