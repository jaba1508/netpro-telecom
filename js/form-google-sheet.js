document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('quoteForm');
    const status = document.getElementById('formStatus');
    const url = "https://script.google.com/macros/s/AKfycbwFRKdSmBb5XdmiSBQqWlSQIb5wXmyn_UAqoGd4gK6siMTYMYyrxUqJ6byTaIyfiDlQ/exec";

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        status.textContent = "Enviando...";
        status.className = "form-status sending";

        const data = {
            nombre: form.nombre.value,
            empresa: form.empresa.value,
            telefono: form.telefono.value,
            email: form.email.value,
            servicio: form.servicio.value,
            mensaje: form.mensaje.value
        };

        fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        })
            .then(response => response.json())
            .then(res => {
                if (res.result === "success") {
                    status.textContent = "¡Solicitud enviada correctamente!";
                    status.className = "form-status success";
                    form.reset();
                } else {
                    throw new Error("Error en el servidor");
                }
            })
            .catch(() => {
                status.textContent = "Hubo un error al enviar. Intenta de nuevo.";
                status.className = "form-status error";
            });
    });
});
