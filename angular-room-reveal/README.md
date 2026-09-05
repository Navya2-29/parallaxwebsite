# Room Reveal — scroll-driven before/after renovation

A pinned scroll section, built for Angular, that recreates the beats of your
video: dated room → furniture clears out piece by piece → clean repainted
room → new furniture settles in one by one → fully renovated room.

## What's in here

```
src/app/room-reveal/
  room-reveal.component.ts     — GSAP + ScrollTrigger timeline (standalone component)
  room-reveal.component.html
  room-reveal.component.scss
src/assets/room-reveal/
  scene-before.jpg              — full "before" photo
  scene-repainted.jpg           — full empty/repainted photo
  scene-after.jpg                — full "after" photo
  old-*.png                      — cut-outs of the 6 old furniture pieces
  new-*.png                      — cut-outs of the 5 new furniture pieces
```

These images were pulled directly from the frames of the video you
uploaded, as a working starting point.

## Install

```bash
npm install gsap
```

Angular 15+ with standalone components is assumed. If your app still uses
NgModules, drop `standalone: true` and the `imports` array from the
component decorator, and declare `RoomRevealComponent` in a module instead.

## Use it

```ts
// in the parent standalone component/module
import { RoomRevealComponent } from './room-reveal/room-reveal.component';

@Component({
  standalone: true,
  imports: [RoomRevealComponent],
  template: `<app-room-reveal></app-room-reveal>`,
})
export class HomeComponent {}
```

Make sure `src/assets/room-reveal/**` is included in your `angular.json`
`assets` array (the default `["src/assets"]` already covers it).

## Using your own photography (recommended for production)

The video you uploaded is actually two *different* real-estate photos (a
tighter-angle "before" shot and a wider-angle "after" shot) joined with a
warp/morph transition — not the same camera position with objects removed.
That's why this build uses the cross-fade + individually-animated furniture
"cut-outs" approach: it gets you the same storytelling beats (declutter →
repaint → restyle) without needing frame-perfect pixel alignment between
two unrelated photos.

For a crisper result with your own project photos:

1. Shoot (or select) the before/after photos from as close to the **same
   camera position** as possible — this is what makes a straight cross-fade
   read as "the same room," rather than a jump cut.
2. Cut each piece of furniture out with a transparent background (any photo
   editor's subject-select/remove-background tool works) instead of the
   soft rectangular crops used here — this is the single biggest quality
   upgrade you can make.
3. Recompute each item's `left / top / width / height` percentages as
   `pixel position ÷ photo width (or height) × 100`, measured on your source
   photo, and update the inline `style` attributes in
   `room-reveal.component.html`.
4. Swap the six `.jpg`/`.png` filenames in `src/assets/room-reveal/` for
   your own, keeping the same names (or update the `src` paths).

## Tuning the timeline

All pacing lives in `room-reveal.component.ts` inside `ngAfterViewInit`.
The timeline uses an arbitrary 0–~7 unit scale; each `.to(...)` call's third
argument is its start position on that scale. To make a phase last longer
relative to scroll distance, either widen the gap between its start position
and the next phase's start position, or increase the `height: 420vh` on
`.scrolly` in the SCSS (taller section = slower-feeling scroll per phase).

`scrub: 0.6` on the ScrollTrigger smooths the animation slightly behind the
actual scroll position — raise it for a lazier feel, drop it to `true` for
1:1 tracking.

## Browser support note

`aspect-ratio` (used to keep the stage sized like the source photos) has
broad modern support; if you need to support older browsers, replace it
with a padding-top percentage hack on `.stage-inner`.
