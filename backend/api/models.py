from django.db import models
from django.contrib.auth.models import User

class Comentario(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    contenido = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    archivo = models.FileField(upload_to='comentarios/', null=True, blank=True)
    likes = models.ManyToManyField(User, related_name='comentarios_likes', blank=True)
    
    class Meta:
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return f"Comentario de {self.usuario.username} - {self.fecha_creacion}"
    
    def total_likes(self):
        return self.likes.count()

class Respuesta(models.Model):
    comentario = models.ForeignKey(Comentario, on_delete=models.CASCADE, related_name='respuestas')
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    contenido = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name='respuestas_likes', blank=True)
    
    class Meta:
        ordering = ['fecha_creacion']
    
    def __str__(self):
        return f"Respuesta de {self.usuario.username} a {self.comentario.id}"
    
    def total_likes(self):
        return self.likes.count()
    
class MaterialEstudio(models.Model):
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    archivo = models.FileField(upload_to='material_estudio/')
    fecha_subida = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    activo = models.BooleanField(default=True)
    orden = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['orden', '-fecha_subida']
        verbose_name = 'Material de Estudio'
        verbose_name_plural = 'Materiales de Estudio'
    
    def __str__(self):
        return self.titulo
    
    def nombre_archivo(self):
        return self.archivo.name.split('/')[-1]