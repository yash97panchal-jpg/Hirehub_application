# HireHub - Job & Internship Portal

## 1. Project Introduction
HireHub is a modern, production-ready web application designed to bridge the gap between job seekers/students and recruiters/companies. It serves as a comprehensive platform where candidates can apply for jobs and internships, and recruiters can manage their hiring pipeline. The system includes three main roles: Candidates, Recruiters, and Administrators, each with distinct features and dashboards.

## 2. Features
- **Candidate Portal:** Profile management, job/internship search, advanced filtering, one-click apply, application tracking, saved jobs, notifications.
- **Recruiter Portal:** Company profiles, job/internship postings, application management (shortlist, interview, select, reject), interview scheduling, analytics.
- **Admin Panel:** Complete platform management, user moderation, analytics dashboards, taxonomy (skills, categories) management.
- **Advanced UI/UX:** Built with Bootstrap 5, featuring a responsive, modern design with glassmorphism touches and 3D visual elements. Dark/Light mode supported.
- **Secure Architecture:** Role-based access control, Django authentication, CSRF/XSS protections.

## 3. Technologies
- **Backend:** Python 3, Django 5+
- **Database:** MySQL
- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5, Chart.js
- **API:** Django REST Framework (DRF)
- **Environment Management:** django-environ

## 4. Requirements
- Python 3.8+
- MySQL Server
- pip (Python package manager)
- virtualenv (recommended)

## 5. Installation & Setup
1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd C:\Hirehub_application
   ```

2. **Set up Virtual Environment:**
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **MySQL Configuration:**
   - Create a MySQL database named `hirehub_db`.
   - Configure your `.env` file (based on `.env.example`) with your database credentials.

5. **Apply Migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create Superuser (Admin):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the Development Server:**
   ```bash
   python manage.py runserver
   ```

## 6. Project Structure
```
hirehub/
├── hirehub_core/ (Settings, URLs, WSGI/ASGI)
├── accounts/ (User models, Auth, Roles)
├── jobs/ (Job & Internship models, logic)
├── applications/ (Application workflow, Saved jobs)
├── profiles/ (Candidate & Recruiter/Company profiles)
├── interactions/ (Notifications, Interviews, Activity)
├── templates/ (HTML Templates)
├── static/ (CSS, JS, Images, 3D Assets)
└── media/ (Uploaded Resumes, Profile Pics, Logos)
```

## 7. Future Enhancements
- Real-time chat between recruiters and candidates.
- AI-based resume parsing and job matching.
- Advanced 3D WebGL visualizations using Three.js for company campus tours.
