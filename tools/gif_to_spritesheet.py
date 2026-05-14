"""Convert an animated GIF into a horizontal sprite sheet PNG.

Usage: python gif_to_spritesheet.py <input.gif> <output.png>
"""
import sys
from pathlib import Path
from PIL import Image, ImageSequence


def convert(in_path: Path, out_path: Path) -> None:
    img = Image.open(in_path)
    frames = []
    for frame in ImageSequence.Iterator(img):
        frames.append(frame.convert("RGBA"))

    if not frames:
        raise SystemExit("No frames found in GIF")

    w, h = frames[0].size
    n = len(frames)
    sheet = Image.new("RGBA", (w * n, h), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        if f.size != (w, h):
            f = f.resize((w, h))
        sheet.paste(f, (i * w, 0), f)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path, "PNG", optimize=True)
    print(f"OK  frames={n}  frameSize={w}x{h}  sheet={w*n}x{h}  out={out_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python gif_to_spritesheet.py <input.gif> <output.png>")
    convert(Path(sys.argv[1]), Path(sys.argv[2]))
