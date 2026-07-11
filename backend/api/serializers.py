from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Comentario, Respuesta, MaterialEstudio

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class RespuestaSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(read_only=True)
    total_likes = serializers.IntegerField(read_only=True)
    usuario_ha_dado_like = serializers.SerializerMethodField()
    
    class Meta:
        model = Respuesta
        fields = ['id', 'comentario', 'contenido', 'fecha_creacion', 'fecha_actualizacion', 
                  'usuario', 'total_likes', 'usuario_ha_dado_like']
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion', 'usuario', 'likes', 'comentario']
        extra_kwargs = {
            'contenido': {'required': True, 'allow_blank': False},
        }
    
    def get_usuario_ha_dado_like(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

class ComentarioSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(read_only=True)
    total_likes = serializers.IntegerField(read_only=True)
    usuario_ha_dado_like = serializers.SerializerMethodField()
    respuestas = RespuestaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Comentario
        fields = ['id', 'contenido', 'fecha_creacion', 'fecha_actualizacion', 
                  'usuario', 'archivo', 'likes', 'total_likes', 
                  'usuario_ha_dado_like', 'respuestas']
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion', 'usuario', 'likes']
        extra_kwargs = {
            'contenido': {'required': True, 'allow_blank': False},
        }
    
    def get_usuario_ha_dado_like(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
    
    def validate(self, data):
        if not data.get('contenido', '').strip():
            raise serializers.ValidationError("El contenido no puede estar vacío")
        return data

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class MaterialEstudioSerializer(serializers.ModelSerializer):
    nombre_archivo = serializers.SerializerMethodField()
    tamaño_archivo = serializers.SerializerMethodField()
    
    class Meta:
        model = MaterialEstudio
        fields = ['id', 'titulo', 'descripcion', 'archivo', 'nombre_archivo', 
                  'tamaño_archivo', 'fecha_subida', 'activo', 'orden']
        read_only_fields = ['fecha_subida', 'fecha_actualizacion']
    
    def get_nombre_archivo(self, obj):
        return obj.archivo.name.split('/')[-1]
    
    def get_tamaño_archivo(self, obj):
        if obj.archivo:
            size = obj.archivo.size
            if size < 1024:
                return f"{size} B"
            elif size < 1024 * 1024:
                return f"{size / 1024:.2f} KB"
            else:
                return f"{size / (1024 * 1024):.2f} MB"
        return "0 B"