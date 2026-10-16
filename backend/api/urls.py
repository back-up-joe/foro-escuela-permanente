from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ComentarioViewSet,
    RespuestaViewSet,
    LoginView,
    MaterialEstudioViewSet,
    InformeViewSet,
    EnlaceViewSet,
    CronogramaViewSet,
    ChatSessionViewSet,
    ChatMessageViewSet,
    RetroalimentacionViewSet,
    CambiarPasswordView,
)

router = DefaultRouter()
router.register(r'comentarios', ComentarioViewSet, basename='comentario')
router.register(r'respuestas', RespuestaViewSet, basename='respuesta')
router.register(r'material-estudio', MaterialEstudioViewSet, basename='material-estudio')
router.register(r'informes', InformeViewSet, basename='informe')
router.register(r'enlaces', EnlaceViewSet, basename='enlace')
router.register(r'cronograma', CronogramaViewSet, basename='cronograma')
router.register(r'chat/sesiones', ChatSessionViewSet, basename='chat-sesion')
router.register(r'chat/mensajes', ChatMessageViewSet, basename='chat-mensaje')
router.register(r'retroalimentaciones', RetroalimentacionViewSet, basename='retroalimentacion')
urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('cambiar-password/', CambiarPasswordView.as_view(), name='cambiar-password'),
    path('', include(router.urls)),
]