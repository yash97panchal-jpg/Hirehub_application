import os
BASE_DIR = os.getcwd()

jobs_models = """from django.db import models
from accounts.models import User

class Job(models.Model):
    title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    job_type = models.CharField(max_length=50, choices=(('Full-Time', 'Full-Time'), ('Part-Time', 'Part-Time'), ('Contract', 'Contract')))
    work_mode = models.CharField(max_length=50, choices=(('Remote', 'Remote'), ('On-Site', 'On-Site'), ('Hybrid', 'Hybrid')))
    description = models.TextField()
    salary = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class Internship(models.Model):
    title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    duration = models.CharField(max_length=50)
    stipend = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
"""
with open(os.path.join(BASE_DIR, 'jobs', 'models.py'), 'w') as f:
    f.write(jobs_models)

jobs_views = """from django.shortcuts import render
from .models import Job, Internship

def job_list(request):
    jobs = Job.objects.all().order_by('-created_at')
    return render(request, 'jobs/job_list.html', {'jobs': jobs})

def internship_list(request):
    internships = Internship.objects.all().order_by('-created_at')
    return render(request, 'jobs/internship_list.html', {'internships': internships})

def companies_list(request):
    return render(request, 'companies/company_list.html')
"""
with open(os.path.join(BASE_DIR, 'jobs', 'views.py'), 'w') as f:
    f.write(jobs_views)

jobs_urls = """from django.urls import path
from . import views

urlpatterns = [
    path('', views.job_list, name='jobs'),
    path('internships/', views.internship_list, name='internships'),
    path('companies/', views.companies_list, name='companies'),
]
"""
with open(os.path.join(BASE_DIR, 'jobs', 'urls.py'), 'w') as f:
    f.write(jobs_urls)

urls_file = os.path.join(BASE_DIR, 'hirehub', 'urls.py')
with open(urls_file, 'r') as f:
    content = f.read()
if "include('jobs.urls')" not in content:
    content = content.replace("]", "    path('jobs/', include('jobs.urls')),\n]")
    with open(urls_file, 'w') as f:
        f.write(content)
