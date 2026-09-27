from django.db import models

class Company(models.Model):
    name = models.CharField(max_length=200)
    industry = models.CharField(max_length=100)
    website = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=100)
    description = models.TextField()
    
    def __str__(self):
        return self.name
