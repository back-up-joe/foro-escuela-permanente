import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'foro.settings')
django.setup()

from django.core.mail import EmailMultiAlternatives

asunto = 'Prueba de correo con imagen'
mensaje_texto = 'Este es un mensaje de prueba desde el Foro Escuela de Cuadros'

mensaje_html = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #db1010; padding: 20px; text-align: center; }
        .header img { max-width: 150px; height: auto; }
        .content { padding: 20px; background-color: #f5f5f5; }
        .footer { background-color: #db1010; color: white; padding: 10px; text-align: center; font-size: 12px; }
        .credentials { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .btn { display: inline-block; background-color: #db1010; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://escueladecuadros.sytes.net/images/escuela-permanente-cuadros.png" alt="Escuela de Cuadros">
        </div>
        <div class="content">
            <h2>¡Bienvenido/a!</h2>
            <p>Este es un <strong>mensaje de prueba</strong> desde el Foro Escuela de Cuadros.</p>
            
            <div class="credentials">
                <h3>Tus credenciales de acceso:</h3>
                <p><strong>Usuario:</strong> usuario_prueba</p>
                <p><strong>Contraseña:</strong> clave1234</p>
            </div>
            
            <p>Puedes acceder al foro haciendo clic en el siguiente botón:</p>
            <p style="text-align: center;">
                <a href="https://escueladecuadros.sytes.net" class="btn">Acceder al Foro</a>
            </p>
            
            <p><small>Te recomendamos cambiar tu contraseña al iniciar sesión por primera vez.</small></p>
        </div>
        <div class="footer">
            <p>© 2026 Escuela Permanente de Cuadros - Comunal Jorge Montes - PC Ñuñoa</p>
            <p><small>Este mensaje es automático, por favor no responder.</small></p>
        </div>
    </div>
</body>
</html>
"""

try:
    email = EmailMultiAlternatives(
        asunto,
        mensaje_texto,
        'jmcontreras.stoltze@gmail.com',
        ['jmcontreras.stoltze@gmail.com']
    )
    email.attach_alternative(mensaje_html, 'text/html')
    email.send(fail_silently=False)
    print('✅ Correo con imagen enviado correctamente!')
    print(f'📧 Enviado a: jmcontreras.stoltze@gmail.com')
except Exception as e:
    print(f'❌ Error al enviar el correo: {e}')