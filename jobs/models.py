from django.db import models
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
