from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComentarioViewSet, RespuestaViewSet, LoginView, MaterialEstudioViewSet, InformeViewSet, EnlaceViewSet, CronogramaViewSet

router = DefaultRouter()
router.register(r'comentarios', ComentarioViewSet, basename='comentario')
router.register(r'respuestas', RespuestaViewSet, basename='respuesta')
router.register(r'material-estudio', MaterialEstudioViewSet, basename='material-estudio')
router.register(r'informes', InformeViewSet, basename='informe')
router.register(r'enlaces', EnlaceViewSet, basename='enlace')
router.register(r'cronograma', CronogramaViewSet, basename='cronograma')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
]