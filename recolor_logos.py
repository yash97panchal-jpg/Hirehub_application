from PIL import Image

# Palette
# Alabaster White: #F7F3E9 -> (247, 243, 233)
# Metallic Brass: #D4AF37 -> (212, 175, 55)
# Deep Sapphire: #0D1B2A -> (13, 27, 42)

COLOR_A = (247, 243, 233)  # Alabaster White (Left letter & tie)
COLOR_B = (212, 175, 55)   # Metallic Brass (Right letter & dot)
BG_FAVICON = (13, 27, 42)  # Deep Sapphire (#0D1B2A)

im_a = Image.open('logo-a.png').convert('RGBA')
im_b = Image.open('logo-b.png').convert('RGBA')

w, h = im_a.size

# 1. Create transparent logo.png
out_logo = Image.new('RGBA', (w, h), (0, 0, 0, 0))

# Colorize A
for x in range(w):
    for y in range(h):
        r, g, b, a = im_a.getpixel((x, y))
        if a > 0:
            out_logo.putpixel((x, y), (COLOR_A[0], COLOR_A[1], COLOR_A[2], a))

# Colorize B & composite
for x in range(w):
    for y in range(h):
        r, g, b, a = im_b.getpixel((x, y))
        if a > 0:
            out_logo.putpixel((x, y), (COLOR_B[0], COLOR_B[1], COLOR_B[2], a))

out_logo.save('logo.png')
print("Saved recolored logo.png (transparent PNG with Alabaster White & Metallic Brass)")

# 2. Create favicon.png (on #0D1B2A square)
favicon = Image.new('RGBA', (w, h), (BG_FAVICON[0], BG_FAVICON[1], BG_FAVICON[2], 255))
# Scale down slightly for nice padding inside the favicon square
scaled_w = int(w * 0.8)
scaled_h = int(h * 0.8)
scaled_logo = out_logo.resize((scaled_w, scaled_h), Image.Resampling.LANCZOS)

offset_x = (w - scaled_w) // 2
offset_y = (h - scaled_h) // 2
favicon.paste(scaled_logo, (offset_x, offset_y), scaled_logo)
favicon.save('favicon.png')
print("Saved recolored favicon.png (#0D1B2A Deep Sapphire background)")

# 3. Create 512x512 app icon
icon512 = Image.new('RGBA', (512, 512), (BG_FAVICON[0], BG_FAVICON[1], BG_FAVICON[2], 255))
scaled_512 = out_logo.resize((int(512 * 0.8), int(512 * 0.8)), Image.Resampling.LANCZOS)
off_x = (512 - scaled_512.width) // 2
off_y = (512 - scaled_512.height) // 2
icon512.paste(scaled_512, (off_x, off_y), scaled_512)
icon512.save('icon.png')
icon512.save('play-store-icon-512.png')
print("Saved 512x512 icon.png and play-store-icon-512.png")

