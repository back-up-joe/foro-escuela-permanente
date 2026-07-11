from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComentarioViewSet, RespuestaViewSet, LoginView, MaterialEstudioViewSet

router = DefaultRouter()
router.register(r'comentarios', ComentarioViewSet, basename='comentario')
router.register(r'respuestas', RespuestaViewSet, basename='respuesta')
router.register(r'material-estudio', MaterialEstudioViewSet, basename='material-estudio')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
]