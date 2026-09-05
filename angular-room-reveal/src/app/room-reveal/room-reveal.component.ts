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
  @ViewChild('uspScrolly') uspScrollyRef?: ElementRef<HTMLElement>;
  @ViewChild('uspTrack') uspTrackRef?: ElementRef<HTMLElement>;
  @ViewChild('editorialLayer') editorialLayerRef?: ElementRef<HTMLElement>;

  activeCaption = 0;
  captions = [
    { tag: '01 — BEFORE', title: 'Dated, closed-in, and cluttered' },
    { tag: '02 — DECLUTTERED', title: 'Every piece cleared away' },
    { tag: '03 — REPAINTED', title: 'A calm, blank canvas' },
    { tag: '04 — RESTYLED', title: 'New furniture finds its place' },
    { tag: '05 — AFTER', title: 'Fully renovated' },
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
    // Phase 1: Big primary image dissolves open (0.03 to 0.15)
    const progress = this.aboutScrollProgress();
    if (progress < 0.03) return false;
    const p = Math.min(Math.max((progress - 0.03) / 0.12, 0), 1);
    return p >= block.normalizedThreshold;
  }

  isSecondaryBlockDissolved(block: PixelBlock): boolean {
    // Phase 2: Small secondary image dissolves open (0.15 to 0.24)
    const progress = this.aboutScrollProgress();
    if (progress < 0.15) return false;
    const p = Math.min(Math.max((progress - 0.15) / 0.09, 0), 1);
    return p >= block.normalizedThreshold;
  }

  isTextRevealed(threshold: number): boolean {
    // Scaled text reveal so it's fully loaded by progress 0.30
    const scaled = threshold * 0.45;
    return this.aboutScrollProgress() >= scaled;
  }

  isUspSectionVisible(): boolean {
    return this.aboutScrollProgress() >= 0.30;
  }

  // About section horizontal track — now only handles the about container itself
  getHorizontalTrackX(): number {
    return 0;
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

      // About section scroll progress for pixel dissolve + text reveal
      ScrollTrigger.create({
        trigger: this.aboutSectionRef.nativeElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          this.aboutScrollProgress.set(self.progress);
        },
      });
    }

    // Initialize the USP portfolio section with independent ScrollTrigger
    this.initUspScrollTrigger();

    // Trigger initial scroll calculation
    this.onWindowScroll();
  }

  /**
   * Independent GSAP ScrollTrigger for the USP Portfolio section.
   * Pins the section and scrubs a master timeline that expands/contracts cards
   * exactly like the reference GSAP demo — one card grows from ~10vw to ~53vw
   * while the active card shrinks from ~53vw to ~10vw, with the track shifting
   * left to keep the active card at ~5% viewport left margin.
   */
  private initUspScrollTrigger(): void {
    if (!this.uspScrollyRef || !this.uspTrackRef) return;

    const section = this.uspScrollyRef.nativeElement;
    const track = this.uspTrackRef.nativeElement;
    const cards = gsap.utils.toArray<HTMLElement>(track.querySelectorAll('.usp-card'));
    const images = gsap.utils.toArray<HTMLElement>(track.querySelectorAll('.usp-card-img'));
    const editorial = this.editorialLayerRef?.nativeElement;

    if (cards.length === 0) return;

    this.uspCtx = gsap.context(() => {
      // Responsive geometry matching the reference demo
      const getActiveWidth = () => {
        const vw = window.innerWidth;
        return Math.max(620, Math.min(vw * 0.53, 1050));
      };

      const getInactiveWidth = () => {
        const vw = window.innerWidth;
        return Math.max(105, Math.min(vw * 0.105, 190));
      };

      // Keep the active card beginning at approximately 5% viewport width
      const getTargetX = (cardIndex: number) => {
        let x = window.innerWidth * 0.05;
        for (let i = 0; i < cardIndex; i++) {
          x -= getInactiveWidth();
        }
        return x;
      };

      // Set initial geometry: Card 0 is active (expanded), rest are inactive (narrow)
      cards.forEach((card, i) => {
        gsap.set(card, {
          width: i === 0 ? getActiveWidth() : getInactiveWidth(),
        });
      });

      // Set initial track position
      gsap.set(track, { x: getTargetX(0) });

      // Set initial image transforms
      images.forEach((img, i) => {
        gsap.set(img, {
          scale: i === 0 ? 1.0 : 1.065,
          xPercent: i === 0 ? 0 : (i % 2 ? -3 : 3),
        });
      });

      // Build master timeline (paused, scrubbed by ScrollTrigger progress)
      const masterTl = gsap.timeline({ paused: true });

      // Set initial state at time 0
      cards.forEach((card, i) => {
        masterTl.set(card, {
          width: i === 0 ? getActiveWidth() : getInactiveWidth(),
        }, 0);
      });
      masterTl.set(track, { x: getTargetX(0) }, 0);

      // Build transitions: card[i] contracts → card[i+1] expands
      for (let i = 0; i < cards.length - 1; i++) {
        const time = i; // Each transition occupies 1 unit of time
        const d = 1;

        // A) Current card contracts from active → inactive width
        masterTl.to(cards[i], {
          width: () => getInactiveWidth(),
          duration: d,
          ease: 'power3.inOut',
        }, time);

        // B) Next card expands from inactive → active width
        masterTl.to(cards[i + 1], {
          width: () => getActiveWidth(),
          duration: d,
          ease: 'power3.inOut',
        }, time);

        // C) Track translates to keep new active card at 5% left margin
        masterTl.to(track, {
          x: () => getTargetX(i + 1),
          duration: d,
          ease: 'power3.inOut',
        }, time);

        // D) Next image settles from zoomed/offset → normal as card opens
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

        // E) Current image drifts as it becomes a side card
        masterTl.to(images[i], {
          scale: 1.065,
          xPercent: i % 2 ? -3 : 3,
          duration: d,
          ease: 'power2.inOut',
        }, time);

        // F) Editorial background typography moves at a slower rate
        if (editorial) {
          masterTl.to(editorial, {
            x: () => -(i + 1) * window.innerWidth * 0.075,
            duration: d,
            ease: 'power2.inOut',
          }, time);
        }
      }

      // Create independent ScrollTrigger — pins the USP section and scrubs the timeline
      this.uspTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => '+=' + window.innerHeight * (cards.length + 1),
        pin: true,
        scrub: 0.85,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          masterTl.progress(self.progress);
        },
      });

    }, section);
  }

  ngOnDestroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.uspCtx?.revert();
    this.uspTrigger?.kill();
    this.aboutTl?.kill();
    this.trigger?.kill();
    this.tl?.kill();
  }
}
