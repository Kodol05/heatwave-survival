"""Remove a checkerboard/solid background from an image via corner flood fill,
crop to content bbox, and resize to target height. Saves as PNG with transparency.

Usage: python remove_bg.py <input> <output> [target_height] [pre_crop_top] [thresh]
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw


def main():
    if len(sys.argv) < 3:
        raise SystemExit("Usage: python remove_bg.py <input> <output> [target_height] [pre_crop_top] [thresh]")
    in_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])
    target_h = int(sys.argv[3]) if len(sys.argv) > 3 else 130
    pre_crop_top = int(sys.argv[4]) if len(sys.argv) > 4 else 0
    thresh = int(sys.argv[5]) if len(sys.argv) > 5 else 30

    img = Image.open(in_path).convert("RGBA")
    print(f"loaded {img.size}")

    if pre_crop_top > 0:
        img = img.crop((0, pre_crop_top, img.width, img.height))

    marker = (255, 0, 255, 255)
    corners = [
        (0, 0),
        (img.width - 1, 0),
        (0, img.height - 1),
        (img.width - 1, img.height - 1),
    ]
    for c in corners:
        try:
            ImageDraw.floodfill(img, c, marker, thresh=thresh)
        except Exception as e:
            print(f"floodfill error at {c}: {e}")

    data = img.load()
    for y in range(img.height):
        for x in range(img.width):
            if data[x, y] == marker:
                data[x, y] = (0, 0, 0, 0)

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    w, h = img.size
    target_w = int(w * target_h / h)
    img = img.resize((target_w, target_h), Image.LANCZOS)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG")
    print(f"OK  size={img.size}  out={out_path}")


if __name__ == "__main__":
    main()
