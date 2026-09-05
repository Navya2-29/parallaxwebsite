import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface PixelBlock {
  row: number;
  col: number;
  delayIn: number;
  delayOut: number;
  normalizedThreshold: number;
}

export interface AboutSquare {
  x: number;
  y: number;
  size: number;
}

@Component({
  selector: 'app-room-reveal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-reveal.component.html',
  styleUrls: ['./room-reveal.component.scss'],
})
export class RoomRevealComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrolly', { static: true }) scrollyRef!: ElementRef<HTMLElement>;
  @ViewChild('stageInner', { static: true }) stageInnerRef!: ElementRef<HTMLElement>;
  @ViewChild('aboutSection') aboutSectionRef!: ElementRef<HTMLElement>;
  @ViewChild('mainTrack') mainTrackRef?: ElementRef<HTMLElement>;
  @ViewChild('uspSection') uspSectionRef?: ElementRef<HTMLElement>;
  @ViewChild('uspTrack') uspTrackRef?: ElementRef<HTMLElement>;
  @ViewChild('editorialLayer') editorialLayerRef?: ElementRef<HTMLElement>;
  @ViewChild('uspFirstSlide') uspFirstSlideRef?: ElementRef<HTMLElement>;
  @ViewChild('servicesSlide') servicesSlideRef?: ElementRef<HTMLElement>;
  @ViewChild('servicesZoomBox') servicesZoomBoxRef?: ElementRef<HTMLElement>;
  @ViewChild('showcaseSection') showcaseSectionRef?: ElementRef<HTMLElement>;
  @ViewChild('projectsPanel') projectsPanelRef?: ElementRef<HTMLElement>;

  private showcaseCtx?: gsap.Context;
  private showcaseTrigger?: ScrollTrigger;

  activeCaption = 0;
  captions = [
    { tag: '01 — BEFORE', title: 'Dated, closed-in, and cluttered' },
    { tag: '02 — DECLUTTERED', title: 'Every piece cleared away' },
    { tag: '03 — REPAINTED', title: 'A calm, blank canvas' },
    { tag: '04 — RESTYLED', title: 'New furniture finds its place' },
    { tag: '05 — AFTER', title: 'Fully renovated' },
  ];

  // Showcase Items for Vertical Stacking Zoom In / Out Sequence
  showcaseItems = [
    {
      id: '01',
      tag: 'LIVING SPACE',
      title: 'VILLA NOUVELLE',
      desc: 'Expansive double-height glazing, integrated minimalist joinery, and monolithic stone flooring connecting interior luxury with natural surroundings.',
      location: 'BARCELONA',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: '02',
      tag: 'CULINARY ARCHITECTURE',
      title: 'ATELIER HAUS',
      desc: 'Sculptural quartzite kitchen island, concealed acoustic fluted timber panels, and tailored ambient illumination engineered for effortless culinary living.',
      location: 'MADRID',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: '03',
      tag: 'SANCTUARY SUITE',
      title: 'SKYLINE RESIDENCE',
      desc: 'Frameless panoramic perimeter glazing, bespoke floating walnut bedframe, and custom concealed dressing architecture for ultimate private sanctuary.',
      location: 'VALENCIA',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
    },
  ];

  // 12 columns x 8 rows pixel-block overlay array (96 blocks)
  pixelBlocks: PixelBlock[] = [];

  // 1:1 Scroll progress for About section reveal (0 to 1)
  aboutScrollProgress = signal(0);

  // Viewport scroll reveal signals for About section images
  primaryRevealed = signal(false);
  secondaryRevealed = signal(false);

  // Magnetic squares for About section images
  primarySquares: AboutSquare[] = [
    { x: 8, y: 20, size: 14 },
    { x: 14, y: 38, size: 10 },
    { x: 78, y: 65, size: 12 },
    { x: 84, y: 80, size: 8 },
  ];

  secondarySquares: AboutSquare[] = [
    { x: 10, y: 24, size: 12 },
    { x: 82, y: 70, size: 10 },
    { x: 88, y: 82, size: 7 },
  ];

  primaryX = 0;
  primaryY = 0;
  primaryTargetX = 0;
  primaryTargetY = 0;

  secondaryX = 0;
  secondaryY = 0;
  secondaryTargetX = 0;
  secondaryTargetY = 0;

  private animFrameId?: number;
  private aboutObserver?: IntersectionObserver;

  ngOnInit(): void {
    // Generate 12x8 pixel blocks array with diagonal stagger delays and normalized thresholds
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 12; c++) {
        this.pixelBlocks.push({
          row: r,
          col: c,
          delayIn: (r + c) * 0.018,
          delayOut: (8 - r + (12 - c)) * 0.012,
          normalizedThreshold: (r + c) / 18,
        });
      }
    }
    this.startMagneticLoop();
  }

  // "WHY CHOOSE US" USP Items matching scrollaniamtion3.mp4
  // "WHY CHOOSE US" USP Items matching pixel-accurate architectural portfolio
  uspItems = [
    {
      id: '01',
      year: '2024',
      location: 'OLEIROS',
      title: 'LA SOLANA',
      desc: 'Structural engineering precision combined with contemporary aesthetic design.',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      cardBg: '#F2EDE4',
      buttonText: 'El proyecto',
    },
    {
      id: '02',
      year: '2024',
      location: 'OLEIROS',
      title: 'PLAZA ESPAÑA 9',
      desc: 'Hand-picked timber, eco-conscious stone, and non-toxic architectural finishes.',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      cardBg: '#616668',
      buttonText: 'El proyecto',
    },
    {
      id: '03',
      year: '2023',
      location: 'PORTONOVO',
      title: 'RUA PEXEGUEIRO',
      desc: 'Smart climate optimization, energy-efficient glazing, and solar integration.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      cardBg: '#C7D7E5',
      buttonText: 'El proyecto',
    },
    {
      id: '04',
      year: '2024',
      location: 'ICARIA IV',
      title: 'JUNO',
      desc: 'Seamless architectural landscape integration and outdoor living balance.',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      cardBg: '#E5DFD5',
      buttonText: 'Soon',
    },
    {
      id: '05',
      year: '2024',
      location: 'MONTROVE',
      title: 'POL43',
      desc: 'Custom interior joinery, bespoke lighting, and tailored finishes.',
      image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      cardBg: '#3E4244',
      buttonText: 'Soon',
    },
  ];

  @HostListener('window:scroll')
  onWindowScroll(): void {
    // Rely on GSAP ScrollTrigger for progress calculation
  }

  isContainerRevealed(): boolean {
    return true;
  }

  isPrimaryBlockDissolved(block: PixelBlock): boolean {
    const progress = this.aboutScrollProgress();
    if (progress < 0.01) return false;
    const p = Math.min(Math.max((progress - 0.01) / 0.06, 0), 1);
    return p >= block.normalizedThreshold;
  }

  isSecondaryBlockDissolved(block: PixelBlock): boolean {
    const progress = this.aboutScrollProgress();
    if (progress < 0.03) return false;
    const p = Math.min(Math.max((progress - 0.03) / 0.06, 0), 1);
    return p >= block.normalizedThreshold;
  }

  isTextRevealed(threshold: number): boolean {
    // Scaled text reveal so it's fully loaded by progress 0.11
    const scaled = threshold * 0.16;
    return this.aboutScrollProgress() >= scaled;
  }

  isUspSectionVisible(): boolean {
    return this.aboutScrollProgress() >= 0.14;
  }

  private startMagneticLoop(): void {
    const loop = () => {
      this.primaryX += (this.primaryTargetX - this.primaryX) * 0.15;
      this.primaryY += (this.primaryTargetY - this.primaryY) * 0.15;

      this.secondaryX += (this.secondaryTargetX - this.secondaryX) * 0.15;
      this.secondaryY += (this.secondaryTargetY - this.secondaryY) * 0.15;

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  onPrimaryPointerMove(event: MouseEvent, targetEl: HTMLElement): void {
    const rect = targetEl.getBoundingClientRect();
    const px = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const py = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
    this.primaryTargetX = (px - 0.5) * 40;
    this.primaryTargetY = (py - 0.5) * 40;
  }

  onPrimaryPointerLeave(): void {
    this.primaryTargetX = 0;
    this.primaryTargetY = 0;
  }

  onSecondaryPointerMove(event: MouseEvent, targetEl: HTMLElement): void {
    const rect = targetEl.getBoundingClientRect();
    const px = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const py = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
    this.secondaryTargetX = (px - 0.5) * 40;
    this.secondaryTargetY = (py - 0.5) * 40;
  }

  onSecondaryPointerLeave(): void {
    this.secondaryTargetX = 0;
    this.secondaryTargetY = 0;
  }

  private tl?: gsap.core.Timeline;
  private trigger?: ScrollTrigger;
  private aboutTl?: gsap.core.Timeline;
  private uspCtx?: gsap.Context;
  private uspTrigger?: ScrollTrigger;

  ngAfterViewInit(): void {
    const root = this.stageInnerRef.nativeElement;

    const oldObjs = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll('.objects-old .obj')
    );
    const newObjs = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll('.objects-new .obj')
    );
    const sceneBefore = root.querySelector('.scene-before');
    const sceneRepainted = root.querySelector('.scene-repainted');
    const sceneAfter = root.querySelector('.scene-after');

    const setCaption = (i: number) => {
      this.activeCaption = i;
    };

    this.tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.scrollyRef.nativeElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
      },
    });

    this.tl.set(oldObjs, { opacity: 1, scale: 1, y: 0, rotate: 0 });
    this.tl.set(newObjs, { opacity: 0, scale: 0.2, y: 24 });

    // Phase 1 — declutter
    this.tl.to(
      oldObjs,
      {
        opacity: 0,
        scale: 0.15,
        y: 36,
        rotate: (i: number) => (i % 2 === 0 ? -8 : 8),
        duration: 1.6,
        stagger: 0.22,
        ease: 'power2.in',
      },
      0.15
    );
    this.tl.to(sceneBefore, { opacity: 0, duration: 1.2 }, 1.2);
    this.tl.to(sceneRepainted, { opacity: 1, duration: 1.2 }, 1.2);
    this.tl.call(() => setCaption(0), undefined, 0);
    this.tl.call(() => setCaption(1), undefined, 0.3);

    // Phase 2 — pause on the repainted, empty room
    this.tl.call(() => setCaption(2), undefined, 2.6);

    // Phase 3 — restyle with new furniture
    this.tl.to(sceneRepainted, { opacity: 0, duration: 1.2 }, 4.6);
    this.tl.to(sceneAfter, { opacity: 1, duration: 1.2 }, 4.6);
    this.tl.to(
      newObjs,
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.5,
        stagger: 0.24,
        ease: 'back.out(1.4)',
      },
      4.2
    );
    this.tl.call(() => setCaption(3), undefined, 3.8);

    // Phase 4 — after
    this.tl.call(() => setCaption(4), undefined, 6.6);

    this.trigger = this.tl.scrollTrigger ?? undefined;

    // About section GSAP Parallax Scroll Timeline
    if (this.aboutSectionRef) {
      const primaryWrapper = this.aboutSectionRef.nativeElement.querySelector('.img-primary');
      const primaryImg = this.aboutSectionRef.nativeElement.querySelector('.img-primary img');
      const secondaryWrapper = this.aboutSectionRef.nativeElement.querySelector('.img-secondary');
      const secondaryImg = this.aboutSectionRef.nativeElement.querySelector('.img-secondary img');

      this.aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: this.aboutSectionRef.nativeElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        },
      });

      this.aboutTl.fromTo(
        primaryWrapper,
        { y: -30 },
        { y: 30, ease: 'none' },
        0
      );

      this.aboutTl.fromTo(
        primaryImg,
        { scale: 1.15 },
        { scale: 1.0, ease: 'none' },
        0
      );

      this.aboutTl.fromTo(
        secondaryWrapper,
        { y: 60, scale: 0.92 },
        { y: -45, scale: 1.0, ease: 'none' },
        0
      );

      this.aboutTl.fromTo(
        secondaryImg,
        { scale: 1.2 },
        { scale: 1.0, ease: 'none' },
        0
      );
    }

    // Initialize the unified About & USP portfolio section with master ScrollTrigger
    this.initUspScrollTrigger();

    // Initialize the vertical stacking zoom showcase section with ScrollTrigger
    this.initShowcaseScrollTrigger();

    // Trigger initial scroll calculation
    this.onWindowScroll();
  }

  /**
   * Continuous Master GSAP ScrollTrigger for About -> USP Intro -> Project Cards.
   * 1. About section pixel dissolve & text reveal in early scroll (progress 0.00 -> 0.12).
   * 2. Right-to-left slide (mainTrack 0 -> -100vw) brings USP panel into viewport.
   * 3. Centered WHY CHOOSE US intro slide with heading and description.
   * 4. Intro slide exits left as Card 01 expands to active ~53vw at 5% left margin.
   * 5. Expanding/contracting card accordion across all 5 project cards.
   */
  private initUspScrollTrigger(): void {
    if (!this.aboutSectionRef || !this.mainTrackRef || !this.uspTrackRef) return;

    const aboutSection = this.aboutSectionRef.nativeElement;
    const mainTrack = this.mainTrackRef.nativeElement;
    const uspTrack = this.uspTrackRef.nativeElement;
    const cards = gsap.utils.toArray<HTMLElement>(uspTrack.querySelectorAll('.usp-card'));
    const images = gsap.utils.toArray<HTMLElement>(uspTrack.querySelectorAll('.usp-card-img'));
    const editorial = this.editorialLayerRef?.nativeElement;
    const firstSlide = this.uspFirstSlideRef?.nativeElement;
    const servicesSlide = this.servicesSlideRef?.nativeElement;
    const servicesZoomBox = this.servicesZoomBoxRef?.nativeElement;

    if (cards.length === 0) return;

    this.uspCtx = gsap.context(() => {
      const getVw = () => window.innerWidth;

      const getActiveWidth = () => {
        const vw = window.innerWidth;
        return Math.max(620, Math.min(vw * 0.53, 1050));
      };

      const getInactiveWidth = () => {
        const vw = window.innerWidth;
        return Math.max(105, Math.min(vw * 0.105, 190));
      };

      const getMargin = () => window.innerWidth * 0.05;
      const getSlide1Width = () => window.innerWidth;

      // Keep active card beginning at approximately 5% viewport width
      // Inside uspTrack: first child is firstSlide (width 100vw).
      // Preceding contracted cards have width getInactiveWidth().
      const getTargetX = (cardIndex: number) => {
        let x = getMargin() - getSlide1Width();
        for (let i = 0; i < cardIndex; i++) {
          x -= getInactiveWidth();
        }
        return x;
      };

      const getServicesTargetX = () => {
        return -(getSlide1Width() + cards.length * getInactiveWidth());
      };

      // Set initial geometry:
      gsap.set(mainTrack, { x: 0 });
      gsap.set(uspTrack, { x: 0 });

      if (firstSlide) {
        gsap.set(firstSlide, { width: () => getSlide1Width() });
      }

      if (servicesSlide) {
        gsap.set(servicesSlide, { width: () => getVw() });
      }

      if (servicesZoomBox) {
        gsap.set(servicesZoomBox, {
          scale: 0.45,
          borderRadius: 36,
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        });
      }

      cards.forEach((card, i) => {
        gsap.set(card, {
          width: i === 0 ? getActiveWidth() : getInactiveWidth(),
        });
      });

      images.forEach((img, i) => {
        gsap.set(img, {
          scale: i === 0 ? 1.0 : 1.065,
          xPercent: i === 0 ? 0 : (i % 2 ? -3 : 3),
        });
      });

      if (editorial) {
        gsap.set(editorial, { x: 0, opacity: 1 });
      }

      // Master Timeline (paused, scrubbed by ScrollTrigger)
      const masterTl = gsap.timeline({ paused: true });

      // Initial state at time 0
      masterTl.set(mainTrack, { x: 0 }, 0);
      masterTl.set(uspTrack, { x: 0 }, 0);
      cards.forEach((card, i) => {
        masterTl.set(card, {
          width: i === 0 ? getActiveWidth() : getInactiveWidth(),
        }, 0);
      });

      // 1. Right-to-Left Slide: About panel slides out left, USP panel enters from right
      // Time 1.0 -> 2.2
      masterTl.to(mainTrack, {
        x: () => -getVw(),
        duration: 1.2,
        ease: 'power2.inOut',
      }, 1.0);

      // (Time 2.2 -> 3.2 is reading window for USP Intro: WHY CHOOSE US & description)

      // 2. Intro Slide exits left, Card 01 becomes active dominant at 5% margin
      // Time 3.2 -> 4.2
      masterTl.to(uspTrack, {
        x: () => getTargetX(0),
        duration: 1.0,
        ease: 'power3.inOut',
      }, 3.2);

      if (editorial) {
        masterTl.to(editorial, {
          x: () => -getVw() * 0.03,
          duration: 1.0,
          ease: 'power2.inOut',
        }, 3.2);
      }

      // 3. Card accordion transitions (Card 0 -> 1 -> 2 -> 3 -> 4)
      for (let i = 0; i < cards.length - 1; i++) {
        const time = 4.2 + i * 0.9;
        const d = 0.9;

        // Current card contracts
        masterTl.to(cards[i], {
          width: () => getInactiveWidth(),
          duration: d,
          ease: 'power3.inOut',
        }, time);

        // Next card expands
        masterTl.to(cards[i + 1], {
          width: () => getActiveWidth(),
          duration: d,
          ease: 'power3.inOut',
        }, time);

        // Track translates to keep next active card at 5% left margin
        masterTl.to(uspTrack, {
          x: () => getTargetX(i + 1),
          duration: d,
          ease: 'power3.inOut',
        }, time);

        // Next image settles into active depth
        masterTl.fromTo(images[i + 1],
          {
            scale: 1.065,
            xPercent: (i + 1) % 2 ? -3 : 3,
          },
          {
            scale: 1.0,
            xPercent: 0,
            duration: d,
            ease: 'power2.inOut',
          },
          time
        );

        // Current image drifts as it becomes side card
        masterTl.to(images[i], {
          scale: 1.065,
          xPercent: i % 2 ? -3 : 3,
          duration: d,
          ease: 'power2.inOut',
        }, time);

        // Editorial typography shifts at slower rate
        if (editorial) {
          masterTl.to(editorial, {
            x: () => -(i + 1) * getVw() * 0.075,
            duration: d,
            ease: 'power2.inOut',
          }, time);
        }
      }

      // 4. Services Slide: After last project card (POL43), Services Section enters from right as a compact container
      const lastIndex = cards.length - 1;
      const servicesStartTime = 4.2 + (cards.length - 1) * 0.9 + 0.2;
      const servicesDuration = 1.2;

      // Last project card contracts
      masterTl.to(cards[lastIndex], {
        width: () => getInactiveWidth(),
        duration: servicesDuration,
        ease: 'power3.inOut',
      }, servicesStartTime);

      masterTl.to(images[lastIndex], {
        scale: 1.065,
        xPercent: -3,
        duration: servicesDuration,
        ease: 'power2.inOut',
      }, servicesStartTime);

      // Track translates to bring Services slide into view
      masterTl.to(uspTrack, {
        x: () => getServicesTargetX(),
        duration: servicesDuration,
        ease: 'power3.inOut',
      }, servicesStartTime);

      if (editorial) {
        masterTl.to(editorial, {
          x: () => -getVw() * 0.45,
          opacity: 0,
          duration: servicesDuration,
          ease: 'power2.inOut',
        }, servicesStartTime);
      }

      // 5. Zoom In: According to scrolling, zoom in the services container to fill the entire screen!
      const zoomStartTime = servicesStartTime + servicesDuration + 0.15;
      const zoomDuration = 1.4;

      if (servicesZoomBox) {
        masterTl.to(servicesZoomBox, {
          scale: 1.0,
          borderRadius: 0,
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
          border: '0px solid rgba(255, 255, 255, 0)',
          duration: zoomDuration,
          ease: 'power2.inOut',
        }, zoomStartTime);
      }

      // Single Unified ScrollTrigger on About/USP pinned section
      this.uspTrigger = ScrollTrigger.create({
        trigger: aboutSection,
        start: 'top top',
        end: () => '+=' + window.innerHeight * 8.5,
        pin: true,
        scrub: 0.85,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          this.aboutScrollProgress.set(self.progress);
          masterTl.progress(self.progress);
        },
      });

    }, aboutSection);
  }

  /**
   * Vertical Stacking Zoom In/Out Showcase ScrollTrigger:
   * 1. First image enters from bottom towards center, starts small, zooms in & expands to showcase size.
   * 2. Heading is positioned at top of image, description at bottom.
   * 3. On scrolling, first image moves to top, zooming out & shrinking in size.
   * 4. Simultaneously, the next image enters from bottom, zooming in & expanding in size.
   */
  private initShowcaseScrollTrigger(): void {
    if (!this.showcaseSectionRef) return;

    const showcaseSection = this.showcaseSectionRef.nativeElement;
    const cards = gsap.utils.toArray<HTMLElement>(showcaseSection.querySelectorAll('.showcase-card'));
    const projectsPanel = this.projectsPanelRef?.nativeElement;

    if (cards.length === 0) return;

    this.showcaseCtx = gsap.context(() => {
      // Set initial geometry:
      // Card 0 starts small from bottom
      gsap.set(cards[0], {
        y: '65%',
        scale: 0.45,
        opacity: 0,
      });

      // Subsequent cards start off-screen below
      for (let i = 1; i < cards.length; i++) {
        gsap.set(cards[i], {
          y: '80%',
          scale: 0.4,
          opacity: 0,
        });
      }

      if (projectsPanel) {
        gsap.set(projectsPanel, { xPercent: 100 });
      }

      const showcaseTl = gsap.timeline({ paused: true });

      // Step 1: First image moves from bottom to center, zooms in and expands to full showcase size
      showcaseTl.to(cards[0], {
        y: '0%',
        scale: 1.0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
      }, 0);

      // (Hold window to read Card 0)

      // Step 2 & 3: Transitions between sequential images
      let lastTransitionTime = 0;
      for (let i = 0; i < cards.length - 1; i++) {
        const transitionTime = 1.6 + i * 2.0;
        lastTransitionTime = transitionTime;
        const d = 1.3;

        // Current image moves to top while zooming out, reducing size, and fading
        showcaseTl.to(cards[i], {
          y: '-75%',
          scale: 0.45,
          opacity: 0,
          duration: d,
          ease: 'power2.inOut',
        }, transitionTime);

        // Simultaneously, next image enters from bottom to center, increasing size and zooming in
        showcaseTl.to(cards[i + 1], {
          y: '0%',
          scale: 1.0,
          opacity: 1,
          duration: d,
          ease: 'power2.inOut',
        }, transitionTime);
      }

      // Step 4: After the last image is shown, slide Projects Section in from Right to Left!
      const lastCardIndex = cards.length - 1;
      const projectsStartTime = lastTransitionTime + 2.0;
      const projectsDuration = 1.4;

      // Last image card drifts left and fades
      showcaseTl.to(cards[lastCardIndex], {
        xPercent: -35,
        opacity: 0,
        duration: projectsDuration,
        ease: 'power2.inOut',
      }, projectsStartTime);

      // Full-screen Projects section slides in from right (100% -> 0%)
      if (projectsPanel) {
        showcaseTl.to(projectsPanel, {
          xPercent: 0,
          duration: projectsDuration,
          ease: 'power2.inOut',
        }, projectsStartTime);
      }

      this.showcaseTrigger = ScrollTrigger.create({
        trigger: showcaseSection,
        start: 'top top',
        end: () => '+=' + window.innerHeight * 7,
        pin: true,
        scrub: 0.85,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          showcaseTl.progress(self.progress);
        },
      });

    }, showcaseSection);
  }

  ngOnDestroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.showcaseCtx?.revert();
    this.showcaseTrigger?.kill();
    this.uspCtx?.revert();
    this.uspTrigger?.kill();
    this.aboutTl?.kill();
    this.trigger?.kill();
    this.tl?.kill();
  }
}
