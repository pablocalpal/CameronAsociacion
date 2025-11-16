    // Constantes de credenciales públicas 
    const PUBLIC_KEY = 'NkDyV8JWHs9OvLcxh';     
    const SERVICE_ID = 'cameron';    
    const TEMPLATE_ID = 'template_duz1hqh';  

    // Inicializar EmailJS
    emailjs.init(PUBLIC_KEY);

    // Manejar el envío del formulario
    document.getElementById('formulario').addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = document.getElementById('submit-btn');
        const messageDiv = document.getElementById('message');

        // Deshabilitar botón y mostrar loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando solicitud...';
        messageDiv.style.display = 'none';

        // Enviar email usando EmailJS
        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, this)
            .then(function (response) {
                console.log('SUCCESS!', response.status, response.text);

                // Mostrar mensaje de éxito
                messageDiv.className = 'message success';
                messageDiv.textContent = '¡Solicitud enviada correctamente! Te contactaremos pronto para completar la inscripción.';
                messageDiv.style.display = 'block';

                // Limpiar formulario
                document.getElementById('formulario').reset();

                // Restaurar botón
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Solicitud de Inscripción';

                // Scroll al mensaje
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            }, function (error) {
                console.log('FAILED...', error);

                // Mostrar mensaje de error
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Error al enviar la solicitud. Por favor, inténtalo de nuevo o contacta directamente con nosotros.';
                messageDiv.style.display = 'block';

                // Restaurar botón
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Solicitud de Inscripción';

                // Scroll al mensaje
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
    });
