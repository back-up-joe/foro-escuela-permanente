from urllib import request

from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Comentario, Respuesta, MaterialEstudio, Informe, Enlace, Cronograma, ChatMessage, ChatSession
from .serializers import ComentarioSerializer, RespuestaSerializer, LoginSerializer, MaterialEstudioSerializer, InformeSerializer, EnlaceSerializer, CronogramaSerializer, ChatMessageSerializer, ChatSessionSerializer
from .services.chatbot import ChatbotService

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

class InformeViewSet(viewsets.ModelViewSet):
    queryset = Informe.objects.all()
    serializer_class = InformeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class EnlaceViewSet(viewsets.ModelViewSet):
    queryset = Enlace.objects.filter(activo=True)
    serializer_class = EnlaceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Solo mostrar enlaces activos
        return Enlace.objects.filter(activo=True).order_by('orden', '-fecha_creacion')

class CronogramaViewSet(viewsets.ModelViewSet):
    queryset = Cronograma.objects.all()
    serializer_class = CronogramaSerializer
    permission_classes = [permissions.IsAuthenticated]

class ChatSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(usuario=self.request.user, activo=True)
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ChatMessage.objects.filter(sesion__usuario=self.request.user)

    @action(detail=False, methods=['post'])
    def send(self, request):
        sesion_id = request.data.get('sesion_id')
        mensaje = request.data.get('mensaje')
    
        if not mensaje:
            return Response({'error': 'El mensaje es requerido'}, status=400)
    
        # Obtener o crear sesión
        if sesion_id:
            try:
                sesion = ChatSession.objects.get(id=sesion_id, usuario=request.user)
            except ChatSession.DoesNotExist:
                return Response({'error': 'Sesión no encontrada'}, status=404)
        else:
            sesion = ChatSession.objects.create(usuario=request.user, titulo=mensaje[:50])
    
        # Guardar mensaje del usuario
        ChatMessage.objects.create(
            sesion=sesion,
            rol='usuario',
            contenido=mensaje
        )
    
        # ✅ CORREGIR: Convertir 'rol' → 'role' y 'contenido' → 'content'
        historial_db = sesion.mensajes.values('rol', 'contenido')
        historial = []
        for msg in historial_db:
            rol = 'user' if msg['rol'] == 'usuario' else 'assistant'
            historial.append({
                'role': rol,
                'content': msg['contenido']
            })
    
        # Llamar al chatbot
        chatbot = ChatbotService()
        respuesta = chatbot.send_message(historial)
    
        if respuesta:
            assistant_msg = ChatMessage.objects.create(
                sesion=sesion,
                rol='asistente',
                contenido=respuesta
            )
            return Response({
                'sesion_id': sesion.id,
                'mensaje': ChatMessageSerializer(assistant_msg).data
            })
        else:
            return Response({'error': 'No se pudo obtener respuesta del chatbot'}, status=500)
    
    '''
    @action(detail=False, methods=['post'])
    def send(self, request):
        sesion_id = request.data.get('sesion_id')
        mensaje = request.data.get('mensaje')
        
        if not mensaje:
            return Response({'error': 'El mensaje es requerido'}, status=400)
        
        # Obtener o crear sesión
        if sesion_id:
            try:
                sesion = ChatSession.objects.get(id=sesion_id, usuario=request.user)
            except ChatSession.DoesNotExist:
                return Response({'error': 'Sesión no encontrada'}, status=404)
        else:
            sesion = ChatSession.objects.create(usuario=request.user, titulo=mensaje[:50])
        
        # Guardar mensaje del usuario
        user_msg = ChatMessage.objects.create(
            sesion=sesion,
            rol='usuario',
            contenido=mensaje
        )
        
        # Obtener historial de la sesión
        historial = list(sesion.mensajes.values('rol', 'contenido'))
        
        # Llamar al chatbot
        chatbot = ChatbotService()
        respuesta = chatbot.send_message(historial)
        
        if respuesta:
            assistant_msg = ChatMessage.objects.create(
                sesion=sesion,
                rol='asistente',
                contenido=respuesta
            )
            return Response({
                'sesion_id': sesion.id,
                'mensaje': ChatMessageSerializer(assistant_msg).data
            })
        else:
            return Response({'error': 'No se pudo obtener respuesta del chatbot'}, status=500)
        '''