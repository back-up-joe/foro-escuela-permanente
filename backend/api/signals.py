from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import (
    Comentario, Respuesta, Informe, Retroalimentacion,
    MaterialEstudio, Enlace, Cronograma
)
from .utils_notificaciones import enviar_notificacion, enviar_notificacion_usuario

def _detalle_nivel(nivel, usuario_tipo3):
    """Devuelve texto que indique el nivel para tipo3"""
    if usuario_tipo3:
        return f" (Nivel {nivel})"
    return ""

@receiver(post_save, sender=Comentario)
def notificar_comentario(sender, instance, created, **kwargs):
    if not created:
        return
    nivel = instance.nivel
    usuario = instance.usuario
    asunto = f"Nuevo comentario en el foro - Nivel {nivel}"
    texto = f"""{usuario.username} ha publicado un nuevo comentario en el Nivel {nivel}:

"{instance.contenido[:200]}{'...' if len(instance.contenido) > 200 else ''}"

Ingresa al foro para ver más detalles.
"""
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #db1010;">💬 Nuevo comentario en el foro</h2>
        <p><strong>{usuario.username}</strong> ha publicado un comentario en el <strong>Nivel {nivel}</strong>:</p>
        <blockquote style="background: #f8f9fa; padding: 12px; border-left: 4px solid #db1010;">
            {instance.contenido[:300]}{'...' if len(instance.contenido) > 300 else ''}
        </blockquote>
        <p><a href="https://escueladecuadros.sytes.net/foro" style="color: #db1010;">Ir al foro</a></p>
    </div>
    """
    enviar_notificacion(asunto, texto, html, nivel)

@receiver(post_save, sender=Respuesta)
def notificar_respuesta(sender, instance, created, **kwargs):
    if not created:
        return
    nivel = instance.nivel
    usuario = instance.usuario
    asunto = f"Nueva respuesta en el foro - Nivel {nivel}"
    texto = f"{usuario.username} ha respondido en el Nivel {nivel}."
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #db1010;">↩️ Nueva respuesta en el foro</h2>
        <p><strong>{usuario.username}</strong> ha respondido en el <strong>Nivel {nivel}</strong>:</p>
        <blockquote style="background: #f8f9fa; padding: 12px; border-left: 4px solid #db1010;">
            {instance.contenido[:300]}
        </blockquote>
        <p><a href="https://escueladecuadros.sytes.net/foro" style="color: #db1010;">Ver respuesta</a></p>
    </div>
    """
    enviar_notificacion(asunto, texto, html, nivel)

@receiver(post_save, sender=Informe)
def notificar_informe(sender, instance, created, **kwargs):
    if not created:
        return
    nivel = instance.nivel
    asunto = f"Nuevo informe subido - Nivel {nivel}"
    texto = f"{instance.usuario.username} ha subido un informe titulado '{instance.titulo}' en el Nivel {nivel}."
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #db1010;">📄 Nuevo informe subido</h2>
        <p><strong>{instance.usuario.username}</strong> ha subido un informe en el <strong>Nivel {nivel}</strong>:</p>
        <p><strong>Título:</strong> {instance.titulo}</p>
        <p><a href="https://escueladecuadros.sytes.net/informes" style="color: #db1010;">Ver informes</a></p>
    </div>
    """
    enviar_notificacion(asunto, texto, html, nivel)

@receiver(post_save, sender=Retroalimentacion)
def notificar_retroalimentacion(sender, instance, created, **kwargs):
    if not created:
        return
    nivel = instance.informe.nivel
    asunto = f"Nueva retroalimentación - Nivel {nivel}"
    texto = f"{instance.usuario.username} ha dejado una retroalimentación en el informe '{instance.informe.titulo}' (Nivel {nivel})."
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #db1010;">🗣️ Nueva retroalimentación</h2>
        <p><strong>{instance.usuario.username}</strong> ha retroalimentado el informe:</p>
        <p><em>{instance.informe.titulo}</em> (Nivel {nivel})</p>
        <blockquote style="background: #f8f9fa; padding: 12px; border-left: 4px solid #db1010;">
            {instance.comentario[:300]}
        </blockquote>
        <p><a href="https://escueladecuadros.sytes.net/informes" style="color: #db1010;">Ver retroalimentación</a></p>
    </div>
    """
    enviar_notificacion(asunto, texto, html, nivel)

@receiver(post_save, sender=MaterialEstudio)
def notificar_material(sender, instance, created, **kwargs):
    if not created:
        return
    nivel = instance.nivel
    asunto = f"Nuevo material de estudio - Nivel {nivel}"
    texto = f"Se ha subido un nuevo material de estudio: '{instance.titulo}' en el Nivel {nivel}."
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #db1010;">📚 Nuevo material de estudio</h2>
        <p>Se ha subido un nuevo material en el <strong>Nivel {nivel}</strong>:</p>
        <p><strong>{instance.titulo}</strong></p>
        <p>{instance.descripcion[:200]}</p>
        <p><a href="https://escueladecuadros.sytes.net/material-estudio" style="color: #db1010;">Ver material</a></p>
    </div>
    """
    enviar_notificacion(asunto, texto, html, nivel)

@receiver(post_save, sender=Enlace)
def notificar_enlace(sender, instance, created, **kwargs):
    if not created:
        return
    nivel = instance.nivel
    asunto = f"Nuevo enlace de sesión - Nivel {nivel}"
    texto = f"Se ha agregado un nuevo enlace en el Nivel {nivel}: '{instance.titulo}'."
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #db1010;">🔗 Nuevo enlace de sesión</h2>
        <p>Se ha agregado un nuevo enlace en el <strong>Nivel {nivel}</strong>:</p>
        <p><strong>{instance.titulo}</strong></p>
        <p><a href="{instance.url}" style="color: #db1010;">Abrir enlace</a></p>
    </div>
    """
    enviar_notificacion(asunto, texto, html, nivel)

@receiver(post_save, sender=Cronograma)
def notificar_cronograma(sender, instance, created, **kwargs):
    if not created:
        return
    nivel = instance.nivel
    asunto = f"Cambios en el cronograma - Nivel {nivel}"
    texto = f"Se ha actualizado el cronograma del Nivel {nivel}. Nueva sesión: {instance.sesion} el {instance.fecha}."
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #db1010;">📅 Cambios en el cronograma</h2>
        <p>Se ha actualizado el cronograma del <strong>Nivel {nivel}</strong>:</p>
        <p><strong>Módulo:</strong> {instance.modulo}</p>
        <p><strong>Sesión:</strong> {instance.sesion}</p>
        <p><strong>Fecha:</strong> {instance.fecha}</p>
        <p><a href="https://escueladecuadros.sytes.net/cronograma" style="color: #db1010;">Ver cronograma</a></p>
    </div>
    """
    enviar_notificacion(asunto, texto, html, nivel)
    