from django.contrib import admin
from .models import Comentario, MaterialEstudio, Respuesta, Informe, Enlace, Cronograma

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