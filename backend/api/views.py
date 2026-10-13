from urllib import request

from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Comentario, Respuesta, MaterialEstudio, Informe, Enlace, Cronograma, ChatMessage, ChatSession, PerfilUsuario
from .serializers import ComentarioSerializer, RespuestaSerializer, LoginSerializer, MaterialEstudioSerializer, InformeSerializer, EnlaceSerializer, CronogramaSerializer, ChatMessageSerializer, ChatSessionSerializer
from .services.chatbot import ChatbotService
from rest_framework.exceptions import PermissionDenied

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
            
            # Obtener o crear el perfil del usuario
            try:
                perfil = user.perfil
            except PerfilUsuario.DoesNotExist:
                perfil = PerfilUsuario.objects.create(usuario=user, tipo_acceso='tipo1')
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'perfil': {
                        'tipo_acceso': perfil.tipo_acceso,
                        'niveles_permitidos': perfil.niveles_permitidos,
                        'es_admin_niveles': perfil.es_admin_niveles,
                    }
                }
            })
        return Response(
            {'error': 'Credenciales inválidas'},
            status=status.HTTP_401_UNAUTHORIZED
        )

'''
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
        }) '''

class ComentarioViewSet(viewsets.ModelViewSet):
    serializer_class = ComentarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        perfil = user.perfil
        nivel = self.request.query_params.get('nivel')
        
        if perfil.tipo_acceso == 'tipo3':
            if nivel:
                return Comentario.objects.filter(nivel=nivel)
            return Comentario.objects.all()
        else:
            return Comentario.objects.filter(nivel__in=perfil.niveles_permitidos)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    def perform_create(self, serializer):
        """Asigna el nivel correctamente según el usuario"""
        user = self.request.user
        perfil = user.perfil
        
        # Obtener el nivel enviado desde el frontend
        nivel_solicitado = self.request.data.get('nivel')
        
        if perfil.tipo_acceso == 'tipo3':
            # Tipo3 puede elegir el nivel
            nivel = int(nivel_solicitado) if nivel_solicitado else 1
            if nivel not in [1, 2]:
                nivel = 1
        else:
            # Tipo1 y tipo2 usan su nivel asignado
            nivel = perfil.niveles_permitidos[0]
        
        # Validar que el usuario pueda ver ese nivel
        if not perfil.puede_ver_nivel(nivel):
            raise PermissionDenied('No tienes permiso para comentar en este nivel')
        
        serializer.save(usuario=user, nivel=nivel)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        comentario = self.get_object()
        
        # Verificar que el usuario pueda ver este nivel
        if not request.user.perfil.puede_ver_nivel(comentario.nivel):
            return Response(
                {'error': 'No tienes permiso para interactuar con este nivel'},
                status=403
            )
        
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
        """Crea una respuesta heredando el nivel del comentario padre"""
        comentario = self.get_object()
        
        # Verificar que el usuario pueda ver este nivel
        if not request.user.perfil.puede_ver_nivel(comentario.nivel):
            return Response(
                {'error': 'No tienes permiso para responder en este nivel'},
                status=403
            )
        
        contenido = request.data.get('contenido', '').strip()
        if not contenido:
            return Response(
                {'error': 'El contenido no puede estar vacío'},
                status=400
            )
        
        # La respuesta hereda el nivel del comentario padre
        respuesta = Respuesta.objects.create(
            comentario=comentario,
            usuario=request.user,
            nivel=comentario.nivel,  # ← Hereda el nivel
            contenido=contenido
        )
        
        serializer = RespuestaSerializer(respuesta, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class RespuestaViewSet(viewsets.ModelViewSet):
    serializer_class = RespuestaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        perfil = user.perfil
        
        # Filtrar por niveles permitidos
        return Respuesta.objects.filter(nivel__in=perfil.niveles_permitidos)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    def perform_create(self, serializer):
        """Asigna el nivel de la respuesta según el comentario padre"""
        comentario_id = self.request.data.get('comentario')
        
        if comentario_id:
            try:
                comentario = Comentario.objects.get(id=comentario_id)
                # Validar que el usuario pueda ver ese nivel
                if not self.request.user.perfil.puede_ver_nivel(comentario.nivel):
                    raise PermissionDenied('No tienes permiso para responder en este nivel')
                serializer.save(usuario=self.request.user, nivel=comentario.nivel)
            except Comentario.DoesNotExist:
                raise PermissionDenied('Comentario no encontrado')
        else:
            perfil = self.request.user.perfil
            nivel = perfil.niveles_permitidos[0]
            serializer.save(usuario=self.request.user, nivel=nivel)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        respuesta = self.get_object()
        
        # Verificar que el usuario pueda ver este nivel
        if not request.user.perfil.puede_ver_nivel(respuesta.nivel):
            return Response(
                {'error': 'No tienes permiso para interactuar con este nivel'},
                status=403
            )
        
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
    serializer_class = MaterialEstudioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        perfil = user.perfil
        nivel = self.request.query_params.get('nivel')
        
        # Tipo3 puede elegir el nivel desde el selector
        if perfil.tipo_acceso == 'tipo3':
            if nivel:
                return MaterialEstudio.objects.filter(
                    nivel=nivel, 
                    activo=True
                ).order_by('orden', '-fecha_subida')
            return MaterialEstudio.objects.filter(
                activo=True
            ).order_by('orden', '-fecha_subida')
        
        # Tipo1 y tipo2 solo ven su nivel
        else:
            return MaterialEstudio.objects.filter(
                nivel__in=perfil.niveles_permitidos, 
                activo=True
            ).order_by('orden', '-fecha_subida')

class InformeViewSet(viewsets.ModelViewSet):
    serializer_class = InformeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        perfil = user.perfil
        nivel = self.request.query_params.get('nivel')
        
        # Tipo3 puede elegir el nivel
        if perfil.tipo_acceso == 'tipo3':
            if nivel:
                return Informe.objects.filter(nivel=nivel)
            return Informe.objects.all()
        else:
            # Tipo1 y tipo2 solo ven su nivel
            return Informe.objects.filter(nivel__in=perfil.niveles_permitidos)
    
    def perform_create(self, serializer):
        user = self.request.user
        perfil = user.perfil
        
        nivel_solicitado = self.request.data.get('nivel')
        
        if perfil.tipo_acceso == 'tipo3':
            nivel = int(nivel_solicitado) if nivel_solicitado else 1
            if nivel not in [1, 2]:
                nivel = 1
        else:
            nivel = perfil.niveles_permitidos[0]
        
        if not perfil.puede_ver_nivel(nivel):
            raise PermissionDenied('No tienes permiso para subir informes en este nivel')
        
        serializer.save(usuario=user, nivel=nivel)

class EnlaceViewSet(viewsets.ModelViewSet):
    serializer_class = EnlaceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        perfil = user.perfil
        nivel = self.request.query_params.get('nivel')
        
        if perfil.tipo_acceso == 'tipo3':
            if nivel:
                return Enlace.objects.filter(nivel=nivel, activo=True)
            return Enlace.objects.filter(activo=True)
        else:
            return Enlace.objects.filter(nivel__in=perfil.niveles_permitidos, activo=True)
    
    def perform_create(self, serializer):
        user = self.request.user
        perfil = user.perfil
        
        nivel_solicitado = self.request.data.get('nivel')
        
        if perfil.tipo_acceso == 'tipo3':
            nivel = int(nivel_solicitado) if nivel_solicitado else 1
            if nivel not in [1, 2]:
                nivel = 1
        else:
            nivel = perfil.niveles_permitidos[0]
        
        if not perfil.puede_ver_nivel(nivel):
            raise PermissionDenied('No tienes permiso para crear enlaces en este nivel')
        
        serializer.save(nivel=nivel)

class CronogramaViewSet(viewsets.ModelViewSet):
    serializer_class = CronogramaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        perfil = user.perfil
        nivel = self.request.query_params.get('nivel')
        
        # Tipo3 puede elegir el nivel desde el selector
        if perfil.tipo_acceso == 'tipo3':
            if nivel:
                return Cronograma.objects.filter(nivel=nivel)
            return Cronograma.objects.all()
        
        # Tipo1 y tipo2 solo ven su nivel
        else:
            return Cronograma.objects.filter(nivel__in=perfil.niveles_permitidos)

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
    
        # CORREGIR: Convertir 'rol' → 'role' y 'contenido' → 'content'
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