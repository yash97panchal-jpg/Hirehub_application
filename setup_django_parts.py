import os
import re

BASE_DIR = os.getcwd()

# Basic updates for settings.py
settings_file = os.path.join(BASE_DIR, 'hirehub', 'settings.py')
with open(settings_file, 'r') as f:
    content = f.read()

# Add apps
content = content.replace(
    "'django.contrib.staticfiles',",
    """'django.contrib.staticfiles',
    'rest_framework',
    'accounts',
    'profiles',
    'companies',
    'jobs',
    'applications',
    'interactions',"""
)

# Use custom user model
content += "\nAUTH_USER_MODEL = 'accounts.User'\n"

# Simple sqlite for now to ensure it runs out of the box if mysql isn't set up
environ_config = f"""
import environ
import os
env = environ.Env(
    DEBUG=(bool, True)
)
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

DATABASES = {{
    'default': env.db('DATABASE_URL', default='sqlite:///' + os.path.join(BASE_DIR, "db.sqlite3").replace('\\\\', '/'))
}}
"""

content = re.sub(r'DATABASES = \{.*?\}', environ_config, content, flags=re.DOTALL)

with open(settings_file, 'w') as f:
    f.write(content)

# models.py for accounts
accounts_models = os.path.join(BASE_DIR, 'accounts', 'models.py')
accounts_code = """from django.db import models
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
"""
with open(accounts_models, 'w') as f:
    f.write(accounts_code)
