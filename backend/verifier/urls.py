from django.urls import path
from .views import SSCMarksheetVerification, CETMarksheetVerification, DomicileCertificateVerification

urlpatterns = [
    path('ssc/', SSCMarksheetVerification.as_view(), name='ssc-verification'),
    path('cet/', CETMarksheetVerification.as_view(), name='cet-verification'),
    path('domicile/', DomicileCertificateVerification.as_view(), name='domicile-verification'),
]