from django.shortcuts import render
from .models import Job, Internship

def job_list(request):
    jobs = Job.objects.all().order_by('-created_at')
    return render(request, 'jobs/job_list.html', {'jobs': jobs})

def internship_list(request):
    internships = Internship.objects.all().order_by('-created_at')
    return render(request, 'jobs/internship_list.html', {'internships': internships})

def companies_list(request):
    return render(request, 'companies/company_list.html')
