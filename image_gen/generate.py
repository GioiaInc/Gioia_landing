"""
balo hero image generator — uses Gemini 3 Pro Image Preview (Nano Banana Pro).

Usage:
  # Run all prompts in parallel:
  python3 generate.py

  # Run a single prompt by index:
  python3 generate.py 0

  # Run a custom prompt:
  python3 generate.py --prompt "your prompt here"

  # Change resolution (1K, 2K, or 4K):
  python3 generate.py --size 4K

Outputs saved to ./outputs/ with prompt-based filenames.
"""

import os
import re
import sys
import argparse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv(Path(__file__).parent / ".env")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
OUTPUT_DIR = Path(__file__).parent / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

DEFAULT_MODEL = "gemini-3-pro-image-preview"
DEFAULT_SIZE = "2K"
ASPECT_RATIO = "16:9"

# ---------------------------------------------------------------------------
# Prompts — edit / add as many as you want
# ---------------------------------------------------------------------------
PROMPTS = [
    "two silhouetted figures standing apart on a dark Central Asian steppe at night, a soft ethereal beam of light connecting them, deep purple and indigo sky, low mist, vast and empty, moody cinematic wide shot, film photography",

    "two distant figures in a dark misty landscape, a gentle glowing light between them, ethereal and dreamlike, deep muted purples and warm amber glow, Central Asian plains, cinematic wide composition",

    "dark atmospheric scene of two people facing each other across open ground, soft luminous energy flowing between them, night steppe, stars fading through haze, deep violet tones, ethereal, cinematic wide shot",

    "two small silhouettes on a vast dark plain, connected by a thin stream of warm ethereal light, moody purple twilight, Central Asian steppe, fog and atmosphere, feeling of quiet intimacy across distance, cinematic wide frame",

    "dark ethereal landscape, two figures barely visible in soft purple haze, a glow of warm light where they face each other, abstract and minimal, deep shadows, dreamlike atmosphere, wide cinematic",

    "two silhouettes emerging from darkness, soft diffused purple and gold light between them, abstract ethereal atmosphere, almost painterly, deep shadows, minimal, wide cinematic composition",

    "dark moody scene two figures standing in a vast void, gentle warm light radiating from the space between them, deep indigo and violet tones, ethereal mist, feeling of connection and solitude, cinematic wide",

    "abstract dark landscape, two human figures as small points of warmth in a vast purple darkness, ethereal light arc connecting them, atmospheric fog, dreamlike, wide cinematic frame",
]


def slugify(text: str, max_len: int = 80) -> str:
    """Turn a prompt into a short, filesystem-safe filename slug."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s]+', '_', text).strip('_')
    return text[:max_len]


def generate_one(client: genai.Client, prompt: str, index: int, model: str, size: str = "2K") -> list[str]:
    """Generate image for a single prompt. Returns list of saved file paths."""
    saved = []
    slug = slugify(prompt)

    print(f"  [{index}] Generating ({size}): {prompt[:80]}...")

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=types.ImageConfig(
                    aspect_ratio=ASPECT_RATIO,
                    image_size=size,
                ),
            ),
        )

        img_count = 0
        for part in response.parts:
            if part.inline_data is not None:
                image = part.as_image()
                filename = f"{slug}_{img_count}.png"
                filepath = OUTPUT_DIR / filename
                image.save(str(filepath))
                saved.append(str(filepath))
                print(f"  [{index}] Saved: {filename}")
                img_count += 1

        if img_count == 0:
            # Check if there was text instead (sometimes model responds with text)
            for part in response.parts:
                if part.text is not None:
                    print(f"  [{index}] Model returned text instead: {part.text[:120]}")

    except Exception as e:
        print(f"  [{index}] Error: {e}")

    return saved


def run_parallel(client: genai.Client, prompts: list[str], model: str, size: str = "2K"):
    """Run all prompts in parallel using threads."""
    print(f"\nGenerating {len(prompts)} prompts")
    print(f"Model: {model}")
    print(f"Resolution: {size}")
    print(f"Aspect ratio: {ASPECT_RATIO}")
    print(f"Output: {OUTPUT_DIR}\n")

    all_saved = []
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {
            executor.submit(generate_one, client, p, i, model, size): i
            for i, p in enumerate(prompts)
        }
        for future in futures:
            result = future.result()
            all_saved.extend(result)

    print(f"\nDone. {len(all_saved)} images saved to {OUTPUT_DIR}/")


def main():
    parser = argparse.ArgumentParser(description="Generate balo hero images")
    parser.add_argument("index", nargs="?", type=int, help="Run a single prompt by index")
    parser.add_argument("--prompt", type=str, help="Run a custom prompt")
    parser.add_argument("--model", type=str, default=DEFAULT_MODEL, help=f"Model (default: {DEFAULT_MODEL})")
    parser.add_argument("--size", type=str, default=DEFAULT_SIZE, choices=["1K", "2K", "4K"], help="Resolution (default: 2K)")
    args = parser.parse_args()

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key == "your-key-here":
        print("Set your GOOGLE_API_KEY in image_gen/.env")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    if args.prompt:
        generate_one(client, args.prompt, 99, args.model, args.size)
    elif args.index is not None:
        if 0 <= args.index < len(PROMPTS):
            generate_one(client, PROMPTS[args.index], args.index, args.model, args.size)
        else:
            print(f"Index {args.index} out of range (0-{len(PROMPTS) - 1})")
    else:
        run_parallel(client, PROMPTS, args.model, args.size)


if __name__ == "__main__":
    main()
