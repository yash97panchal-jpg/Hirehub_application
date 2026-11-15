import zipfile
import os

zip_name = "HireHub-v5-rethemed.zip"

exclude_dirs = {'node_modules', '.git', '.vercel', 'HIREHUB_PRODUCTION_QA', 'hirehub-older-design-backup', '.gemini'}
exclude_exts = {'.zip', '.log'}

print(f"Creating {zip_name}...")

with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
    # 1. Add root files
    root_files = [
        'index.html', 'style.css', 'app.js', 'pages.js', 'ui.js', 'dynamic.js',
        'manifest.json', 'sw.js', 'favicon.png', 'logo.png', 'icon.png',
        'play-store-icon-512.png', 'logo-a.png', 'logo-b.png', 'package.json', 'README.md'
    ]
    for rf in root_files:
        if os.path.exists(rf):
            zipf.write(rf, rf)
            print(f"Added root file: {rf}")

    # 2. Add dist directory
    for root, dirs, files in os.walk('dist'):
        for f in files:
            path = os.path.join(root, f)
            zipf.write(path, path)

    # 3. Add migrations and supabase
    for folder in ['migrations', 'supabase']:
        if os.path.exists(folder):
            for root, dirs, files in os.walk(folder):
                for f in files:
                    path = os.path.join(root, f)
                    zipf.write(path, path)

    # 4. Add Job Portal Web App (clean)
    for root, dirs, files in os.walk('Job Portal Web App'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for f in files:
            if any(f.endswith(ext) for ext in exclude_exts):
                continue
            path = os.path.join(root, f)
            zipf.write(path, path)

print(f"Successfully created {zip_name} (Size: {os.path.getsize(zip_name) / (1024*1024):.2f} MB)")
