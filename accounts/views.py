from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import AuthenticationForm
from .models import User
from django.contrib import messages

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('home')
    else:
        form = AuthenticationForm()
    return render(request, 'accounts/login.html', {'form': form})

def register_view(request):
    # Basic registration logic for Candidate
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        role = request.POST.get('role', 'candidate')
        
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(username=username, email=email, password=password, role=role)
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Username already exists.')
    return render(request, 'accounts/register.html')

def logout_view(request):
    logout(request)
    return redirect('home')
