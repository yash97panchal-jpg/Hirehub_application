from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('candidate', 'Candidate'),
        ('recruiter', 'Recruiter'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='candidate')
    
    def is_candidate(self):
        return self.role == 'candidate'
        
    def is_recruiter(self):
        return self.role == 'recruiter'
        
    def is_admin_role(self):
        return self.role == 'admin' or self.is_superuser
