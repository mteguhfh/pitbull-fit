import math
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

os.makedirs('assets', exist_ok=True)
os.makedirs('public', exist_ok=True)

def create_pitbull_head_image(width=1024, height=1024, is_adaptive=False, is_splash=False):
    # Supersampling 2x for anti-aliasing
    scale = 2
    sw, sh = width * scale, height * scale
    
    # Base image: RGBA
    if is_adaptive:
        img = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    else:
        img = Image.new('RGBA', (sw, sh), (8, 8, 10, 255)) # #08080a

    draw = ImageDraw.Draw(img)

    # Ambient Crimson Glow in center if not transparent adaptive
    if not is_adaptive:
        glow = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow)
        center_x, center_y = sw // 2, int(sh * (0.42 if is_splash else 0.5))
        glow_radius = int(sw * 0.38)
        glow_draw.ellipse(
            (center_x - glow_radius, center_y - glow_radius, center_x + glow_radius, center_y + glow_radius),
            fill=(179, 34, 48, 75)
        )
        glow = glow.filter(ImageFilter.GaussianBlur(radius=80 * scale))
        img = Image.alpha_composite(img, glow)
        draw = ImageDraw.Draw(img)

    # Mascot coordinates based on SVG 0-100 coordinate space
    # Target box in canvas:
    if is_splash:
        box_w = sw * 0.52
        box_h = sh * 0.52
        offset_x = (sw - box_w) / 2
        offset_y = sh * 0.16
    elif is_adaptive:
        # Safe area for adaptive icon is inner 60%
        box_w = sw * 0.58
        box_h = sh * 0.58
        offset_x = (sw - box_w) / 2
        offset_y = (sh - box_h) / 2
    else:
        box_w = sw * 0.76
        box_h = sh * 0.76
        offset_x = (sw - box_w) / 2
        offset_y = (sh - box_h) / 2

    def pt(x, y):
        return (offset_x + (x / 100.0) * box_w, offset_y + (y / 100.0) * box_h)

    def pts_from_str(s):
        pairs = s.strip().split()
        return [pt(float(p.split(',')[0]), float(p.split(',')[1])) for p in pairs]

    # Layer 1: Left Ear
    draw.polygon(pts_from_str("18,12 36,32 16,36"), fill=(30, 30, 38, 255), outline=(68, 68, 85, 255), width=int(2.5 * scale))
    draw.polygon(pts_from_str("22,18 32,30 20,32"), fill=(147, 27, 38, 180))

    # Layer 2: Right Ear
    draw.polygon(pts_from_str("82,12 64,32 84,36"), fill=(30, 30, 38, 255), outline=(68, 68, 85, 255), width=int(2.5 * scale))
    draw.polygon(pts_from_str("78,18 68,30 80,32"), fill=(147, 27, 38, 180))

    # Layer 3: Main Head / Cranium
    draw.polygon(pts_from_str("28,26 72,26 84,48 76,74 50,86 24,74 16,48"), fill=(28, 28, 36, 255), outline=(179, 34, 48, 255), width=int(3 * scale))

    # Brow Ridge
    brow_pts = pts_from_str("22,46 38,40 50,44 62,40 78,46")
    draw.line(brow_pts, fill=(90, 90, 110, 255), width=int(3.5 * scale), joint="round")

    # Layer 4: Snout / Muzzle
    draw.polygon(pts_from_str("36,54 64,54 59,76 50,82 41,76"), fill=(45, 45, 56, 255), outline=(55, 55, 70, 255), width=int(2.5 * scale))

    # Nose Tip
    draw.polygon(pts_from_str("45,67 55,67 50,72"), fill=(210, 35, 55, 255))

    # Jaw Seam
    draw.line([pt(50, 72), pt(50, 78)], fill=(18, 18, 24, 255), width=int(3 * scale))

    # Collar / Neck Ridge
    draw.polygon(pts_from_str("32,84 50,92 68,84 62,94 50,98 38,94"), fill=(22, 22, 28, 255), outline=(179, 34, 48, 255), width=int(2.5 * scale))

    # Collar Studs / Spikes
    for sx, sy in [(42, 91), (50, 95), (58, 91)]:
        sp = pt(sx, sy)
        sr = 2.8 * scale * (box_w / (100.0 * scale))
        draw.ellipse((sp[0] - sr, sp[1] - sr, sp[0] + sr, sp[1] + sr), fill=(255, 45, 70, 255))

    # Eye Sockets
    draw.polygon(pts_from_str("29,46 44,44 41,52 32,52"), fill=(10, 10, 14, 255), outline=(45, 45, 55, 255), width=int(2 * scale))
    draw.polygon(pts_from_str("71,46 56,44 59,52 68,52"), fill=(10, 10, 14, 255), outline=(45, 45, 55, 255), width=int(2 * scale))

    # Glowing Crimson Pupils
    for ex, ey in [(36.5, 48), (63.5, 48)]:
        ep = pt(ex, ey)
        erx = 5.0 * scale * (box_w / (100.0 * scale))
        ery = 3.2 * scale * (box_w / (100.0 * scale))
        draw.ellipse((ep[0] - erx, ep[1] - ery, ep[0] + erx, ep[1] + ery), fill=(255, 30, 60, 255))
        # Inner white specular reflection
        draw.ellipse((ep[0] - erx * 0.35, ep[1] - ery * 0.45, ep[0] + erx * 0.15, ep[1] + ery * 0.15), fill=(255, 255, 255, 255))

    # For Splash Screen: Add "PITBULL FIT" text and subtitle
    if is_splash:
        try:
            # Try to load a nice system font or fallback
            font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(68 * scale))
            font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(24 * scale))
        except Exception:
            font_title = ImageFont.load_default()
            font_sub = ImageFont.load_default()

        # Render "PITBULL FIT"
        text_y = int(sh * 0.72)
        # Measure text width
        t1, t2 = "PITBULL ", "FIT"
        w1 = draw.textlength(t1, font=font_title)
        w2 = draw.textlength(t2, font=font_title)
        total_w = w1 + w2
        start_x = (sw - total_w) / 2
        draw.text((start_x, text_y), t1, font=font_title, fill=(255, 255, 255, 255))
        draw.text((start_x + w1, text_y), t2, font=font_title, fill=(255, 30, 60, 255))

        # Subtitle
        sub_text = "HEAVY STRENGTH & HYPERTROPHY"
        sub_w = draw.textlength(sub_text, font=font_sub)
        draw.text(((sw - sub_w) / 2, text_y + int(85 * scale)), sub_text, font=font_sub, fill=(160, 160, 175, 255))

    # Downsample with Lanczos for crisp, anti-aliased finish
    final_img = img.resize((width, height), Image.Resampling.LANCZOS)
    return final_img

# 1. Main app icon (1024x1024 PNG)
icon = create_pitbull_head_image(1024, 1024, is_adaptive=False, is_splash=False)
icon.save('assets/icon.png', 'PNG')
print("Generated assets/icon.png")

# 2. Android adaptive icon foreground (1024x1024 PNG)
adaptive_icon = create_pitbull_head_image(1024, 1024, is_adaptive=True, is_splash=False)
adaptive_icon.save('assets/adaptive-icon.png', 'PNG')
print("Generated assets/adaptive-icon.png")

# 3. Splash screen icon (1024x1024 PNG)
splash_icon = create_pitbull_head_image(1024, 1024, is_adaptive=False, is_splash=True)
splash_icon.save('assets/splash-icon.png', 'PNG')
print("Generated assets/splash-icon.png")

# 4. Web favicon (48x48 PNG)
favicon = create_pitbull_head_image(48, 48, is_adaptive=False, is_splash=False)
favicon.save('assets/favicon.png', 'PNG')
print("Generated assets/favicon.png")

# Also save to public/
favicon.save('public/favicon.png', 'PNG')
# And ICO format for legacy browsers
favicon.save('public/favicon.ico', format='ICO', sizes=[(48, 48), (32, 32), (16, 16)])
print("Generated public/favicon.png and public/favicon.ico")
