from django.db import models
from django.contrib.auth.models import User
# from django.utils import ValidationError

from django.core.exceptions import ValidationError

'''
def validate_pdf(file):
    import magic
    import os
    
    # Validar extensión
    if not file.name.endswith('.pdf'):
        raise ValidationError('Solo se permiten archivos PDF')
    
    # Validar tipo MIME
    mime = magic.from_buffer(file.read(1024), mime=True)
    file.seek(0)
    if mime != 'application/pdf':
        raise ValidationError('El archivo debe ser un PDF válido') '''

def validate_pdf(file):
    # Validar extensión
    if not file.name.endswith('.pdf'):
        raise ValidationError('Solo se permiten archivos PDF')
    
    # Validar encabezado PDF (sin necesidad de python-magic)
    file.seek(0)
    header = file.read(5)
    file.seek(0)
    if header != b'%PDF-':
        raise ValidationError('El archivo no es un PDF válido')
    
    return file

class Comentario(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    contenido = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    #archivo = models.FileField(upload_to='comentarios/', null=True, blank=True)

    archivo = models.FileField(upload_to='comentarios/', null=True, blank=True, validators=[validate_pdf])

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

class Informe(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    archivo = models.FileField(upload_to='informes/', validators=[validate_pdf])
    fecha_subida = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-fecha_subida']
        verbose_name = 'Informe'
        verbose_name_plural = 'Informes'
    
    def __str__(self):
        return f"{self.titulo} - {self.usuario.username}"
    
    def nombre_archivo(self):
        return self.archivo.name.split('/')[-1]

class Enlace(models.Model):
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    url = models.URLField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    orden = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['orden', '-fecha_creacion']
        verbose_name = 'Enlace'
        verbose_name_plural = 'Enlaces'
    
    def __str__(self):
        return self.titulo

class Cronograma(models.Model):
    TIPO_CHOICES = [
        ('presencial', 'Presencial'),
        ('virtual', 'Virtual'),
    ]
    
    nivel = models.IntegerField()
    mes = models.CharField(max_length=20)
    modulo = models.CharField(max_length=20)
    sesion = models.CharField(max_length=30)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    dia = models.CharField(max_length=10)
    fecha = models.DateField()
    semana_calendario = models.IntegerField()
    semana_numero = models.IntegerField()
    inicio = models.TimeField(null=True, blank=True)
    termino = models.TimeField(null=True, blank=True)
    relator = models.CharField(max_length=100, blank=True)
    trabajo = models.CharField(max_length=100, blank=True)
    entrega = models.DateField(null=True, blank=True)
    
    class Meta:
        ordering = ['fecha', 'nivel']
        verbose_name = 'Cronograma'
        verbose_name_plural = 'Cronograma'