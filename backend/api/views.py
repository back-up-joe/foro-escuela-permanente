from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Comentario, Respuesta, MaterialEstudio
from .serializers import ComentarioSerializer, RespuestaSerializer, LoginSerializer, MaterialEstudioSerializer

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username
                }
            })
        return Response(
            {'error': 'Credenciales inválidas'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

class ComentarioViewSet(viewsets.ModelViewSet):
    queryset = Comentario.objects.all()
    serializer_class = ComentarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comentario = self.get_object()
        if request.user in comentario.likes.all():
            comentario.likes.remove(request.user)
            liked = False
        else:
            comentario.likes.add(request.user)
            liked = True
        return Response({
            'liked': liked,
            'total_likes': comentario.total_likes()
        })
    
    @action(detail=True, methods=['post'])
    def responder(self, request, pk=None):
        comentario = self.get_object()
        
        # Verificar que se envió contenido
        contenido = request.data.get('contenido', '').strip()
        if not contenido:
            return Response(
                {'error': 'El contenido de la respuesta no puede estar vacío'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear la respuesta manualmente
        respuesta = Respuesta.objects.create(
            comentario=comentario,
            usuario=request.user,
            contenido=contenido
        )
        
        # Serializar y devolver
        serializer = RespuestaSerializer(respuesta, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class RespuestaViewSet(viewsets.ModelViewSet):
    queryset = Respuesta.objects.all()
    serializer_class = RespuestaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        respuesta = self.get_object()
        if request.user in respuesta.likes.all():
            respuesta.likes.remove(request.user)
            liked = False
        else:
            respuesta.likes.add(request.user)
            liked = True
        return Response({
            'liked': liked,
            'total_likes': respuesta.total_likes()
        })
    
class MaterialEstudioViewSet(viewsets.ModelViewSet):
    queryset = MaterialEstudio.objects.filter(activo=True)
    serializer_class = MaterialEstudioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Solo mostrar materiales activos
        return MaterialEstudio.objects.filter(activo=True).order_by('orden', '-fecha_subida')