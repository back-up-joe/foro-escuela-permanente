from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.contrib.auth.models import User
from .models import PerfilUsuario

def obtener_destinatarios(nivel):
    """
    Devuelve los usuarios que deben recibir notificación para un nivel:
    - Usuarios tipo1 en nivel 1 o tipo2 en nivel 2 (según corresponda)
    - Usuarios tipo3 siempre (porque ven ambos niveles)
    """
    # Usuarios tipo3 siempre reciben todo
    usuarios_tipo3 = User.objects.filter(perfil__tipo_acceso='tipo3', is_active=True)
    
    # Usuarios del nivel específico
    if nivel == 1:
        usuarios_nivel = User.objects.filter(perfil__tipo_acceso='tipo1', is_active=True)
    elif nivel == 2:
        usuarios_nivel = User.objects.filter(perfil__tipo_acceso='tipo2', is_active=True)
    else:
        usuarios_nivel = User.objects.none()
    
    # Combinar y eliminar duplicados
    return (usuarios_tipo3 | usuarios_nivel).distinct()

def enviar_notificacion(asunto, mensaje_texto, mensaje_html, nivel):
    """
    Envía un correo a todos los usuarios correspondientes al nivel.
    """
    destinatarios = obtener_destinatarios(nivel)
    
    if not destinatarios.exists():
        print(f"No hay destinatarios para el nivel {nivel}")
        return
    
    print(f"Enviando notificación a {destinatarios.count()} usuarios del nivel {nivel}")
    
    for usuario in destinatarios:
        if not usuario.email:
            continue
        
        try:
            email = EmailMultiAlternatives(
                asunto,
                mensaje_texto,
                settings.DEFAULT_FROM_EMAIL,
                [usuario.email]
            )
            email.attach_alternative(mensaje_html, 'text/html')
            email.send(fail_silently=True)
            print(f"Enviado a {usuario.email}")
        except Exception as e:
            print(f"Error al enviar a {usuario.email}: {e}")

def enviar_notificacion_usuario(asunto, mensaje_texto, mensaje_html, usuario):
    """
    Envía una notificación a un único usuario (para cambios de contraseña).
    """
    if not usuario.email:
        print(f"Usuario {usuario.username} sin email")
        return
    
    try:
        email = EmailMultiAlternatives(
            asunto,
            mensaje_texto,
            settings.DEFAULT_FROM_EMAIL,
            [usuario.email]
        )
        email.attach_alternative(mensaje_html, 'text/html')
        email.send(fail_silently=True)
        print(f"Notificación enviada a {usuario.email}")
    except Exception as e:
        print(f"Error al enviar a {usuario.email}: {e}")