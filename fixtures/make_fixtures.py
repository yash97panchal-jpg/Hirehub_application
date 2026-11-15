import os

fixtures_dir = r'C:\Hirehub_application\fixtures'
os.makedirs(fixtures_dir, exist_ok=True)

# 1. Valid 1x1 transparent/colored PNG
png_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xa7V\x01\x84\x00\x00\x00\x00IEND\xaeB`\x82'
with open(os.path.join(fixtures_dir, 'valid_logo.png'), 'wb') as f:
    f.write(png_bytes)

# 2. Wrong type
with open(os.path.join(fixtures_dir, 'wrong_type.txt'), 'w', encoding='utf-8') as f:
    f.write('This is an unsupported text file.')

# 3. Oversize file (>2.2MB)
with open(os.path.join(fixtures_dir, 'oversize.png'), 'wb') as f:
    # Write 2.2MB of mock data starting with PNG header
    f.write(png_bytes + b'0' * (2300000))

# 4. Malicious SVG
with open(os.path.join(fixtures_dir, 'malicious.svg'), 'w', encoding='utf-8') as f:
    f.write('<svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script><circle cx="10" cy="10" r="5"/></svg>')

# 5. Clean SVG
with open(os.path.join(fixtures_dir, 'clean_logo.svg'), 'w', encoding='utf-8') as f:
    f.write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#5BC0DE"/></svg>')

print("Fixtures created successfully.")
