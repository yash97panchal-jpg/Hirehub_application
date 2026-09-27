from django.contrib import admin
from .models import Job, Internship

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company_name', 'location', 'job_type', 'created_at')
    list_filter = ('job_type', 'work_mode')
    search_fields = ('title', 'company_name')

@admin.register(Internship)
class InternshipAdmin(admin.ModelAdmin):
    list_display = ('title', 'company_name', 'location', 'duration', 'created_at')
    list_filter = ('duration',)
    search_fields = ('title', 'company_name')
