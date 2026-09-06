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
import { FormsModule } from '@angular/forms';
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

export interface ProjectItem {
  id: string;
  num: string;
  tag: string;
  title: string;
  location: string;
  year: string;
  scope: string;
  area: string;
  materials: string;
  desc: string;
  image: string;
  accentColor: string;
  badge?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  image: string;
}

export interface ReviewItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  company?: string;
  avatar: string;
  rating?: number;
}

@Component({
  selector: 'app-room-reveal',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  @ViewChild('gallerySection') gallerySectionRef?: ElementRef<HTMLElement>;
  @ViewChild('galleryTrack') galleryTrackRef?: ElementRef<HTMLElement>;
  @ViewChild('galleryLeftCol') galleryLeftColRef?: ElementRef<HTMLElement>;
  @ViewChild('galleryRightCol') galleryRightColRef?: ElementRef<HTMLElement>;
  @ViewChild('reviewSection') reviewSectionRef?: ElementRef<HTMLElement>;
  @ViewChild('reviewZoomBox') reviewZoomBoxRef?: ElementRef<HTMLElement>;
  @ViewChild('reviewWhiteBackdrop') reviewWhiteBackdropRef?: ElementRef<HTMLElement>;
  @ViewChild('enquirySection') enquirySectionRef?: ElementRef<HTMLElement>;
  @ViewChild('enquiryZoomBox') enquiryZoomBoxRef?: ElementRef<HTMLElement>;

  // Enquiry / Project Contact Form Model matching screenshot
  enquiryForm = {
    fullName: '',
    email: '',
    phone: '',
    service: '',
    projectType: '',
    location: '',
    projectScale: '',
  };

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

  // Architectural Project Cards with Left Details & Right Image for Right-to-Left Page Stacking
  projectsList: ProjectItem[] = [
    {
      id: '01',
      num: '01',
      tag: 'RESIDENTIAL ARCHITECTURE',
      title: 'THE MONOLITH HOUSE',
      location: 'COSTA BRAVA, SPAIN',
      year: '2024',
      scope: 'Architecture & Turnkey Interior Renovation',
      area: '740 m²',
      materials: 'Travertine Stone, Fluted Oak, Burnished Brass',
      desc: 'An iconic cliffside residence sculpted with cantilevered raw concrete, warm travertine stone, and floor-to-ceiling panoramic ocean glazing that seamlessly blurs the boundary between interior tranquility and Mediterranean grandeur.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      accentColor: '#778663',
      badge: 'Award Winner 2024',
    },
    {
      id: '02',
      num: '02',
      tag: 'MINIMALIST INTERIORS',
      title: 'KAZA PENTHOUSE',
      location: 'MADRID, SPAIN',
      year: '2024',
      scope: 'Penthouse Remodeling & Bespoke Joinery',
      area: '480 m²',
      materials: 'Microcement, Smoked Walnut, Black Steel',
      desc: 'A double-height urban sanctuary featuring bespoke acoustic walnut wall paneling, a monolithic black granite sculptural kitchen island, and hidden ambient lighting designed for timeless modern living.',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
      accentColor: '#8FA377',
      badge: 'Featured in AD Spain',
    },
    {
      id: '03',
      num: '03',
      tag: 'HERITAGE RESTORATION',
      title: 'PALACIO SAN MATEO',
      location: 'SEVILLE, SPAIN',
      year: '2023',
      scope: 'Historic Preservation & Modern Revival',
      area: '860 m²',
      materials: 'Reclaimed Terracotta, Cast Bronze, Italian Marble',
      desc: 'Preserving 19th-century structural arches and ornate plasterwork while seamlessly integrating cutting-edge geothermal climate systems, bespoke brass fixtures, and a secluded courtyard reflection pool.',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80',
      accentColor: '#667753',
      badge: 'Heritage Excellence',
    },
    {
      id: '04',
      num: '04',
      tag: 'COASTAL SANCTUARY',
      title: 'AURA HORIZON VILLA',
      location: 'IBIZA, SPAIN',
      year: '2024',
      scope: 'Passive Architecture & Landscape Integration',
      area: '620 m²',
      materials: 'White Limestone, Bleached Ash, Architectural Glass',
      desc: 'Harmonious organic architecture engineered with passive solar cooling, curved limestone masonry, infinity reflection pools, and seamless indoor-outdoor living pavilions overlooking the Balearic Sea.',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
      accentColor: '#9DB387',
      badge: 'Sustainable Design 2024',
    },
  ];

  // Gallery Section Heading, Subheading & Editorial Description
  galleryData = {
    eyebrow: 'ARCHITECTURAL GALLERY',
    badge: 'Curated Spaces',
    title: 'Spaces Crafted For Modern Living',
    description: 'A visual showcase of our bespoke residential transformations, architectural facades, seamless indoor-outdoor living pavilions, and tailored interior joinery. Each space reflects our commitment to structural precision, natural materiality, and timeless aesthetic serenity.',
    pillars: [
      { text: 'Structural Precision' },
      { text: 'Sustainable Craftsmanship' },
      { text: 'Timeless Materiality' },
    ],
  };

  // Gallery Editorial Showcase Items for Left Column Vertical Scroll (Bottom to Top)
  galleryImages: GalleryItem[] = [
    {
      id: '01',
      title: 'THE SUNKEN POOL & LOUNGE',
      category: 'OUTDOOR LIVING',
      location: 'OLEIROS',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: '02',
      title: 'VILLA HORIZON RESIDENCE',
      category: 'RESIDENTIAL ARCHITECTURE',
      location: 'BARCELONA',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: '03',
      title: 'MEDITERRANEAN GARDEN & PATIO',
      category: 'LANDSCAPE DESIGN',
      location: 'MADRID',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: '04',
      title: 'TERRACE PAVILION & WATER FEATURE',
      category: 'EXTERIOR LIVING',
      location: 'IBIZA',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: '05',
      title: 'BESPOKE TIMBER ATELIER',
      category: 'INTERIOR ARCHITECTURE',
      location: 'VALENCIA',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  // Client Reviews List
  reviewsList: ReviewItem[] = [
    {
      id: '01',
      quote: "An extraordinary renovation experience with a world-class architectural team. The attention to natural light, bespoke timber joinery, and structural finishes exceeded every expectation.",
      name: 'Elena Valenta',
      role: 'Private Villa Owner',
      company: 'Costa Brava',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      rating: 5,
    },
    {
      id: '02',
      quote: "An exceptional architecture and turnkey renovation team. Their dedication to natural materiality, spatial flow, and flawless structural execution turned our property into an absolute masterpiece.",
      name: 'Emily Peterson',
      role: 'Managing Director',
      company: 'Peterson Design Atelier',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      rating: 5,
    },
    {
      id: '03',
      quote: "We've been looking for an architecture & turnkey remodeling team of this calibre since we founded our private residential estate. Flawless execution from initial blueprint to handover.",
      name: 'Adrien Jacquot',
      role: 'Principal Partner',
      company: 'Luxury Living EU',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      rating: 5,
    },
    {
      id: '04',
      quote: "Transforming our 19th-century townhouse while preserving its historic integrity was a monumental task. Renovast delivered absolute architectural perfection.",
      name: 'Marcus Sterling',
      role: 'Private Investor',
      company: 'Madrid',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      rating: 5,
    },
    {
      id: '05',
      quote: "From initial 3D visualization to turnkey handover, every deadline was honored and the material quality is second to none. Truly inspirational craftsmanship.",
      name: 'Sophia Laurent',
      role: 'Creative Director',
      company: 'Barcelona',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      rating: 5,
    },
  ];

  activeReviewIndex = signal(1);

  nextReview(): void {
    const nextIdx = (this.activeReviewIndex() + 1) % this.reviewsList.length;
    this.activeReviewIndex.set(nextIdx);
  }

  prevReview(): void {
    const prevIdx = (this.activeReviewIndex() - 1 + this.reviewsList.length) % this.reviewsList.length;
    this.activeReviewIndex.set(prevIdx);
  }

  setReview(index: number): void {
    if (index >= 0 && index < this.reviewsList.length) {
      this.activeReviewIndex.set(index);
    }
  }

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

  // "WHY CHOOSE US" USP Items matching pixel-accurate architectural portfolio
  uspItems = [
    {
      id: '01',
      year: '2024',
      location: 'OLEIROS',
      title: 'LA SOLANA',
      desc: 'Structural engineering precision combined with contemporary aesthetic design.',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      cardBg: '#EEF2E8',
      buttonText: 'Explore Project',
    },
    {
      id: '02',
      year: '2024',
      location: 'OLEIROS',
      title: 'PLAZA ESPAÑA 9',
      desc: 'Hand-picked timber, eco-conscious stone, and non-toxic architectural finishes.',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      cardBg: '#536049',
      buttonText: 'Explore Project',
    },
    {
      id: '03',
      year: '2023',
      location: 'PORTONOVO',
      title: 'RUA PEXEGUEIRO',
      desc: 'Smart climate optimization, energy-efficient glazing, and solar integration.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      cardBg: '#C5D0BA',
      buttonText: 'Explore Project',
    },
    {
      id: '04',
      year: '2024',
      location: 'ICARIA IV',
      title: 'JUNO',
      desc: 'Seamless architectural landscape integration and outdoor living balance.',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      cardBg: '#E2E8DC',
      buttonText: 'Coming Soon',
    },
    {
      id: '05',
      year: '2024',
      location: 'MONTROVE',
      title: 'POL43',
      desc: 'Custom interior joinery, bespoke lighting, and tailored finishes.',
      image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      cardBg: '#323C2C',
      buttonText: 'Coming Soon',
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
    const projectPages = gsap.utils.toArray<HTMLElement>(showcaseSection.querySelectorAll('.project-page-layer'));
    const gallerySection = this.gallerySectionRef?.nativeElement;
    const galleryTrack = this.galleryTrackRef?.nativeElement;
    const galleryLeftCol = this.galleryLeftColRef?.nativeElement;
    const galleryRightCol = this.galleryRightColRef?.nativeElement;
    const galleryImages = gsap.utils.toArray<HTMLElement>(gallerySection?.querySelectorAll('.gallery-card-img') || []);
    const reviewSection = this.reviewSectionRef?.nativeElement;
    const reviewZoomBox = this.reviewZoomBoxRef?.nativeElement;
    const reviewWhiteBackdrop = this.reviewWhiteBackdropRef?.nativeElement;
    const enquirySection = this.enquirySectionRef?.nativeElement;
    const enquiryZoomBox = this.enquiryZoomBoxRef?.nativeElement;

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

      // Initial state for stacking project pages (off-screen to the right)
      projectPages.forEach((page) => {
        gsap.set(page, {
          xPercent: 100,
          scale: 1,
          filter: 'brightness(1)',
        });
      });

      // Initial state for gallery section:
      // Right Col (Title/Description) starts Full Screen (100vw)
      // Left Col (Image Track) starts tucked away
      if (gallerySection) {
        gsap.set(gallerySection, { xPercent: 100 });
      }
      if (galleryRightCol) {
        gsap.set(galleryRightCol, { width: '100vw' });
      }
      if (galleryLeftCol) {
        gsap.set(galleryLeftCol, { xPercent: -100, opacity: 0 });
      }
      if (galleryTrack) {
        gsap.set(galleryTrack, { yPercent: 100 });
      }

      // Initial state for white backdrop & review section
      if (reviewWhiteBackdrop) {
        gsap.set(reviewWhiteBackdrop, { opacity: 0 });
      }
      if (reviewSection) {
        gsap.set(reviewSection, { opacity: 0, pointerEvents: 'none' });
      }
      if (reviewZoomBox) {
        gsap.set(reviewZoomBox, {
          scale: 0.18,
          borderRadius: 36,
          opacity: 0,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        });
      }

      // Initial state for enquiry section (starts small width)
      if (enquirySection) {
        gsap.set(enquirySection, { opacity: 0, pointerEvents: 'none' });
      }
      if (enquiryZoomBox) {
        gsap.set(enquiryZoomBox, {
          yPercent: 75,
          scale: 0.38,
          borderRadius: 44,
          opacity: 0,
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.25)',
        });
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

      // Full-screen Projects intro section slides in from right (100% -> 0%)
      if (projectsPanel) {
        showcaseTl.to(projectsPanel, {
          xPercent: 0,
          duration: projectsDuration,
          ease: 'power2.inOut',
        }, projectsStartTime);
      }

      // Step 5: Sequential Right-to-Left Stacking Project Pages (Hover/Page-over-page effect)
      let currentTimelineTime = projectsStartTime + projectsDuration + 0.8;

      projectPages.forEach((page, index) => {
        const pageDuration = 1.4;
        const holdTime = 1.2;

        // 1. If it's the first project page (index 0), scale down and dim the projectsPanel behind it
        if (index === 0 && projectsPanel) {
          showcaseTl.to(projectsPanel, {
            scale: 0.94,
            filter: 'brightness(0.5)',
            opacity: 0.35,
            duration: pageDuration,
            ease: 'power2.inOut',
          }, currentTimelineTime);
        }

        // 2. If it's a subsequent page (index > 0), the previous project page moves slightly left and dims as the new page covers it
        if (index > 0) {
          const prevPage = projectPages[index - 1];
          showcaseTl.to(prevPage, {
            xPercent: -12,
            scale: 0.95,
            filter: 'brightness(0.6)',
            duration: pageDuration,
            ease: 'power2.inOut',
          }, currentTimelineTime);
        }

        // 3. Current page slides in from Right to Left directly over the previous layer
        showcaseTl.fromTo(page,
          { xPercent: 100 },
          {
            xPercent: 0,
            duration: pageDuration,
            ease: 'power2.out',
          },
          currentTimelineTime
        );

        // Advance timeline
        currentTimelineTime += pageDuration + holdTime;
      });

      // Step 6: Gallery Section enters from Right to Left with FULL-SCREEN Title & Description
      const galleryStartTime = currentTimelineTime;
      const gallerySlideDuration = 1.4;

      if (projectPages.length > 0) {
        const lastProjectPage = projectPages[projectPages.length - 1];
        showcaseTl.to(lastProjectPage, {
          xPercent: -12,
          scale: 0.95,
          filter: 'brightness(0.6)',
          duration: gallerySlideDuration,
          ease: 'power2.inOut',
        }, galleryStartTime);
      }

      if (gallerySection) {
        showcaseTl.fromTo(gallerySection,
          { xPercent: 100 },
          {
            xPercent: 0,
            duration: gallerySlideDuration,
            ease: 'power2.out',
          },
          galleryStartTime
        );
      }

      // Hold window on Full-Screen Title & Description
      const fullScreenHoldDuration = 1.4;
      const splitTransitionTime = galleryStartTime + gallerySlideDuration + fullScreenHoldDuration;
      const splitTransitionDuration = 1.5;

      // Step 7: Title & Description moves from Full Screen to Right Side (col-6) & Left Col enters
      if (galleryRightCol) {
        showcaseTl.to(galleryRightCol, {
          width: '50vw',
          duration: splitTransitionDuration,
          ease: 'power3.inOut',
        }, splitTransitionTime);
      }

      if (galleryLeftCol) {
        showcaseTl.fromTo(galleryLeftCol,
          { xPercent: -100, opacity: 0 },
          {
            xPercent: 0,
            opacity: 1,
            duration: splitTransitionDuration,
            ease: 'power3.inOut',
          },
          splitTransitionTime
        );
      }

      // Step 8: Left Column Gallery Images scroll smoothly from Bottom to Top
      const galleryScrollStartTime = splitTransitionTime + splitTransitionDuration + 0.4;
      const galleryScrollDuration = 6.5;

      if (galleryTrack) {
        showcaseTl.fromTo(galleryTrack,
          { yPercent: 100 },
          {
            yPercent: -75,
            duration: galleryScrollDuration,
            ease: 'none',
          },
          galleryScrollStartTime
        );
      }

      // Parallax effect on gallery images
      if (galleryImages.length > 0) {
        showcaseTl.fromTo(galleryImages,
          { yPercent: 15 },
          {
            yPercent: -15,
            duration: galleryScrollDuration,
            ease: 'none',
          },
          galleryScrollStartTime
        );
      }

      // Step 9A: Zoom Out Gallery Section Fully & Fade In Clean White Screen
      const galleryZoomOutStartTime = galleryScrollStartTime + galleryScrollDuration + 0.4;
      const galleryZoomOutDuration = 1.4;

      if (reviewWhiteBackdrop) {
        showcaseTl.to(reviewWhiteBackdrop, {
          opacity: 1,
          duration: 0.9,
          ease: 'power2.inOut',
        }, galleryZoomOutStartTime);
      }

      if (gallerySection) {
        showcaseTl.to(gallerySection, {
          scale: 0.05,
          opacity: 0,
          borderRadius: 60,
          duration: galleryZoomOutDuration,
          ease: 'power2.inOut',
        }, galleryZoomOutStartTime);
      }

      // Step 9B: Show Clean White Screen for a dedicated moment
      const whiteScreenStartTime = galleryZoomOutStartTime + galleryZoomOutDuration;
      const whiteScreenHoldDuration = 1.2;

      // Step 9C: Show A Little Bit of the Review Section (Floating Card Preview on White Canvas)
      const reviewPreviewStartTime = whiteScreenStartTime + whiteScreenHoldDuration;
      const reviewPreviewDuration = 1.2;

      if (reviewSection) {
        showcaseTl.fromTo(reviewSection,
          { opacity: 0, pointerEvents: 'none' },
          {
            opacity: 1,
            pointerEvents: 'auto',
            duration: 0.6,
            ease: 'power2.out',
          },
          reviewPreviewStartTime
        );
      }

      if (reviewZoomBox) {
        showcaseTl.fromTo(reviewZoomBox,
          {
            scale: 0.18,
            borderRadius: 36,
            opacity: 0,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
          },
          {
            scale: 0.42,
            borderRadius: 36,
            opacity: 1,
            boxShadow: '0 30px 100px rgba(0, 0, 0, 0.16)',
            duration: reviewPreviewDuration,
            ease: 'power2.out',
          },
          reviewPreviewStartTime
        );
      }

      // Hold window so user clearly sees "a little bit" of the review section on the white canvas
      const reviewPreviewHold = 1.4;

      // Step 9D: Zoom In the Review Section to fill the entire screen!
      const reviewZoomInStartTime = reviewPreviewStartTime + reviewPreviewDuration + reviewPreviewHold;
      const reviewZoomInDuration = 1.8;

      if (reviewZoomBox) {
        showcaseTl.to(reviewZoomBox, {
          scale: 1.0,
          borderRadius: 0,
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
          duration: reviewZoomInDuration,
          ease: 'power2.inOut',
        }, reviewZoomInStartTime);
      }

      // Step 10: Smooth reading of reviews
      const reviewHoldStartTime = reviewZoomInStartTime + reviewZoomInDuration + 0.3;
      showcaseTl.call(() => this.activeReviewIndex.set(0), undefined, reviewHoldStartTime);
      showcaseTl.call(() => this.activeReviewIndex.set(1), undefined, reviewHoldStartTime + 0.9);
      showcaseTl.call(() => this.activeReviewIndex.set(2), undefined, reviewHoldStartTime + 1.8);

      // Step 11: Enquiry Section shows up from bottom to top while increasing size to fill screen
      const enquiryStartTime = reviewHoldStartTime + 2.4;
      const enquiryDuration = 2.4;

      if (reviewSection) {
        showcaseTl.to(reviewSection, {
          yPercent: -40,
          scale: 0.85,
          opacity: 0,
          pointerEvents: 'none',
          duration: enquiryDuration * 0.8,
          ease: 'power2.inOut',
        }, enquiryStartTime);
      }

      if (enquirySection) {
        showcaseTl.fromTo(enquirySection,
          { opacity: 0, pointerEvents: 'none' },
          {
            opacity: 1,
            pointerEvents: 'auto',
            duration: 0.4,
            ease: 'none',
          },
          enquiryStartTime
        );
      }

      if (enquiryZoomBox) {
        showcaseTl.fromTo(enquiryZoomBox,
          {
            yPercent: 75,
            scale: 0.38,
            borderRadius: 44,
            opacity: 0.2,
            boxShadow: '0 30px 90px rgba(0, 0, 0, 0.25)',
          },
          {
            yPercent: 0,
            scale: 1.0,
            borderRadius: 0,
            opacity: 1,
            boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
            duration: enquiryDuration,
            ease: 'power2.out',
          },
          enquiryStartTime
        );
      }

      this.showcaseTrigger = ScrollTrigger.create({
        trigger: showcaseSection,
        start: 'top top',
        end: () => '+=' + window.innerHeight * (8 + (projectPages.length || 4) * 2.2 + 28.0),
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

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
