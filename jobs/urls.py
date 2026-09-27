from django.urls import path
from . import views

urlpatterns = [
    path('', views.job_list, name='jobs'),
    path('internships/', views.internship_list, name='internships'),
    path('companies/', views.companies_list, name='companies'),
]
