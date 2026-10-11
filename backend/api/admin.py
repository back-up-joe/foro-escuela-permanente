from django.contrib import admin
from .models import Comentario, MaterialEstudio, Respuesta, Informe, Enlace, Cronograma, ChatSession, ChatMessage

@admin.register(Comentario)
class ComentarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'contenido', 'fecha_creacion', 'total_likes')
    list_filter = ('fecha_creacion', 'usuario')
    search_fields = ('contenido', 'usuario__username')
    filter_horizontal = ('likes',)

@admin.register(Respuesta)
class RespuestaAdmin(admin.ModelAdmin):
    list_display = ('id', 'comentario', 'usuario', 'contenido', 'fecha_creacion', 'total_likes')
    list_filter = ('fecha_creacion', 'usuario')
    search_fields = ('contenido', 'usuario__username')
    filter_horizontal = ('likes',)

@admin.register(MaterialEstudio)
class MaterialEstudioAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'fecha_subida', 'activo', 'orden')
    list_filter = ('activo', 'fecha_subida')
    search_fields = ('titulo', 'descripcion')
    ordering = ('orden', '-fecha_subida')
    fields = ('titulo', 'descripcion', 'archivo', 'activo', 'orden')

@admin.register(Informe)
class InformeAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'usuario', 'fecha_subida')
    list_filter = ('fecha_subida', 'usuario')
    search_fields = ('titulo', 'descripcion', 'usuario__username')
    ordering = ('-fecha_subida',)

@admin.register(Enlace)
class EnlaceAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'url', 'activo', 'orden', 'fecha_creacion')
    list_filter = ('activo', 'fecha_creacion')
    search_fields = ('titulo', 'descripcion', 'url')
    ordering = ('orden', '-fecha_creacion')
    fields = ('titulo', 'descripcion', 'url', 'activo', 'orden')

@admin.register(Cronograma)
class CronogramaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nivel', 'modulo', 'sesion', 'tipo', 'fecha', 'relator')
    list_filter = ('nivel', 'tipo', 'fecha')
    search_fields = ('modulo', 'sesion', 'relator', 'trabajo')
    ordering = ('fecha', 'nivel')
    fields = (
        'nivel', 'mes', 'modulo', 'sesion', 'tipo', 
        'dia', 'fecha', 'semana_calendario', 'semana_numero',
        'inicio', 'termino', 'relator', 'trabajo', 'entrega'
    )

from django.contrib import admin
from django.utils.html import format_html
from .models import Comentario, MaterialEstudio, Respuesta, Informe, Enlace, Cronograma, ChatSession, ChatMessage

# ==================== ADMIN DEL CHATBOT ====================

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'titulo', 'creado', 'actualizado', 'activo', 'total_mensajes')
    list_filter = ('activo', 'creado', 'usuario')
    search_fields = ('titulo', 'usuario__username')
    ordering = ('-actualizado',)
    readonly_fields = ('creado', 'actualizado', 'ver_conversacion')
    
    fieldsets = (
        ('Información de la Sesión', {
            'fields': ('usuario', 'titulo', 'activo')
        }),
        ('Conversación', {
            'fields': ('ver_conversacion',)
        }),
        ('Fechas', {
            'fields': ('creado', 'actualizado'),
            'classes': ('collapse',)
        }),
    )
    
    def total_mensajes(self, obj):
        return obj.mensajes.count()
    total_mensajes.short_description = 'Mensajes'
    
    def ver_conversacion(self, obj):
        """Muestra la conversación completa en texto plano"""
        mensajes = obj.mensajes.all().order_by('creado')
        
        if not mensajes:
            return "No hay mensajes en esta sesión"
        
        lineas = []
        lineas.append("=" * 60)
        lineas.append(f"CONVERSACIÓN - {obj.usuario.username}")
        lineas.append(f"Título: {obj.titulo}")
        lineas.append("=" * 60)
        lineas.append("")
        
        for msg in mensajes:
            fecha = msg.creado.strftime('%d/%m/%Y %H:%M')
            
            if msg.rol == 'usuario':
                lineas.append(f"USUARIO [{fecha}]:")
                lineas.append(f"   {msg.contenido}")
                lineas.append("")
            elif msg.rol == 'asistente':
                lineas.append(f"ASISTENTE [{fecha}]:")
                lineas.append(f"   {msg.contenido}")
                lineas.append("")
            else:
                lineas.append(f"SISTEMA [{fecha}]: {msg.contenido}")
                lineas.append("")
        
        lineas.append("=" * 60)
        lineas.append(f"Total: {mensajes.count()} mensajes")
        lineas.append("=" * 60)
        
        return "\n".join(lineas)
    ver_conversacion.short_description = 'Conversación'
    
    actions = ['activar_sesiones', 'desactivar_sesiones']
    
    def activar_sesiones(self, request, queryset):
        actualizados = queryset.update(activo=True)
        self.message_user(request, f'{actualizados} sesiones activadas')
    activar_sesiones.short_description = 'Activar sesiones seleccionadas'
    
    def desactivar_sesiones(self, request, queryset):
        actualizados = queryset.update(activo=False)
        self.message_user(request, f'{actualizados} sesiones desactivadas')
    desactivar_sesiones.short_description = 'Desactivar sesiones seleccionadas'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sesion', 'rol', 'contenido_corto', 'creado')
    list_filter = ('rol', 'creado', 'sesion__usuario')
    search_fields = ('contenido', 'sesion__usuario__username')
    ordering = ('-creado',)
    readonly_fields = ('creado',)
    
    fieldsets = (
        ('Información del Mensaje', {
            'fields': ('sesion', 'rol', 'contenido')
        }),
        ('Fecha', {
            'fields': ('creado',),
            'classes': ('collapse',)
        }),
    )
    
    def contenido_corto(self, obj):
        if len(obj.contenido) > 80:
            return obj.contenido[:80] + '...'
        return obj.contenido
    contenido_corto.short_description = 'Contenido'
