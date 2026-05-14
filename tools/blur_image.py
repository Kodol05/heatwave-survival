"""Resize and blur an image for use as a game background.

Usage: python blur_image.py <input> <output> [radius] [width] [height]
"""
import sys
from pathlib import Path
from PIL import Image, ImageFilter


def main():
    if len(sys.argv) < 3:
        raise SystemExit("Usage: python blur_image.py <input> <output> [radius] [width] [height]")
    in_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])
    radius = float(sys.argv[3]) if len(sys.argv) > 3 else 6.0
    width = int(sys.argv[4]) if len(sys.argv) > 4 else None
    height = int(sys.argv[5]) if len(sys.argv) > 5 else None

    img = Image.open(in_path)
    if width and height:
        img = img.resize((width, height), Image.LANCZOS)
    img = img.filter(ImageFilter.GaussianBlur(radius=radius))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(out_path, "JPEG", quality=85)
    print(f"OK  blur={radius}  size={img.size}  out={out_path}")


if __name__ == "__main__":
    main()
