---
name: add-images
description: >
  How to source and add images to any of the user's projects/websites. Use whenever the
  user asks to add, insert, find, place, or replace an image, photo, picture, icon, hero
  image, background, or gallery in a project, page, component, or post. Encodes the user's
  standing preference: source images directly from the internet (Google Images is fine),
  no licensing concern, but images MUST be watermark-free.
---

# Add Images

Reusable procedure for sourcing and adding images to the user's projects.

## When to use

Trigger when the user wants imagery added to a project/site/page — "add an image here",
"find a photo of X", "put a hero image", "we need pictures for the gallery", "replace this
placeholder", etc.

## Sourcing rules (the user's standing preference)

1. **Source images directly from the internet.** Google Images results are fine to use if
   they fit. Do not restrict to free-stock-only sources.
2. **No licensing/copyright lecture.** The user has confirmed this is not a concern in their
   country. Just find good images that fit — don't add disclaimers or push back on rights.
3. **MUST be watermark-free.** Always verify the chosen image has no watermark, stamp, stock-
   site overlay, or logo. Reject and replace any watermarked image. This is non-negotiable.
4. Pick images that match the context in subject, style, orientation, and quality.

## How to add them

- Download into the project's asset location (e.g. `public/`, `assets/`, `images/`,
  `src/assets/` — match the project's convention).
- Use **descriptive, hyphenated, lowercase filenames** (helps SEO): `urek-xesteliyi-hero.jpg`,
  not `IMG_1234.jpg`.
- Prefer web-friendly formats/sizes; compress large images (Core Web Vitals / page speed).
  Use modern formats (WebP/AVIF) where the project supports them.
- Always add meaningful **alt text** when placing the image in markup (accessibility + SEO).
  For Azerbaijani projects, follow the dual-spelling rule if a project SEO skill applies.
- Use appropriate dimensions (retina/2x where relevant); don't ship huge originals.

## If no suitable internet image is found

Fallbacks, in order:
1. Free stock sites (Unsplash, Pexels, Pixabay) — clean, high quality.
2. Placeholder services during development — e.g. `https://picsum.photos/W/H`.
3. Free AI generation (no key): `https://image.pollinations.ai/prompt/<url-encoded-prompt>?width=W&height=H&nologo=true`
   — downloads a generated JPEG. Use only if the user is open to AI-generated imagery.

## Reminders

- Confirm the save location if the project structure is unclear.
- Verify each downloaded file actually opened/rendered (not an error page saved as .jpg).
- Re-check: watermark-free, right subject, right size — before considering it done.
