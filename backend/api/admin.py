from django.contrib import admin
from .models import Comentario, MaterialEstudio, Respuesta

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