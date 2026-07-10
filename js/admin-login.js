async function irAlPanelSiHaySesion() {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) {
        location.href = './panel.html';
    }
}

irAlPanelSiHaySesion();

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-btn');
    const messageDiv = document.getElementById('message');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Comprobando...';
    messageDiv.style.display = 'none';

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Email o contraseña incorrectos.';
        messageDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Entrar';
        return;
    }

    location.href = './panel.html';
});
