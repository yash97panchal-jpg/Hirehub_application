from django.contrib import admin
from .models import Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'industry', 'location')
    search_fields = ('name',)
