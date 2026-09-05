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

export interface FloatingSquare {
  x: number;
  y: number;
  size: number;
}

export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  year: string;
  image: string;
  squares: FloatingSquare[];
}

export interface PixelBlock {
  row: number;
  col: number;
  delayIn: number;
  delayOut: number;
}

export interface CardState {
  isHovered: boolean;
  currX: number;
  currY: number;
  targetX: number;
  targetY: number;
}

export interface MarqueeLogo {
  name: string;
  type: 'code' | 'dots' | 'circle-ring' | 'arrow' | 'wave-circle' | 'lines' | 'bolt' | 'plus';
}

@Component({
  selector: 'app-projects-case-studies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects-case-studies.component.html',
  styleUrls: ['./projects-case-studies.component.css'],
})
export class ProjectsCaseStudiesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sectionRef') sectionRef!: ElementRef<HTMLElement>;
  @ViewChild('headerRef') headerRef!: ElementRef<HTMLElement>;

  // Top area 8 floating squares configuration
  topSquares: FloatingSquare[] = [
    { x: 6, y: 20, size: 12 },
    { x: 12, y: 32, size: 8 },
    { x: 8, y: 44, size: 6 },
    { x: 88, y: 18, size: 10 },
    { x: 92, y: 30, size: 14 },
    { x: 85, y: 42, size: 7 },
    { x: 90, y: 52, size: 5 },
    { x: 14, y: 56, size: 5 },
  ];

  // Parallax smooth values for top 8 squares
  topParallaxY: number[] = new Array(8).fill(0);
  targetParallaxY: number[] = new Array(8).fill(0);

  // Case Studies Data
  caseStudies: CaseStudy[] = [
    {
      id: 'heartx',
      title: 'HeartX',
      category: 'Brand Strategy & Product Design',
      year: '2026',
      image: 'https://images.pexels.com/photos/7691249/pexels-photo-7691249.jpeg?auto=compress&cs=tinysrgb&w=800',
      squares: [
        { x: 5, y: 30, size: 16 },
        { x: 10, y: 42, size: 10 },
        { x: 3, y: 52, size: 7 },
        { x: 80, y: 70, size: 14 },
        { x: 85, y: 82, size: 9 },
        { x: 78, y: 60, size: 6 },
      ],
    },
    {
      id: 'swave',
      title: 'Swave®',
      category: 'Web Design & Identity',
      year: '2025',
      image: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=800',
      squares: [
        { x: 82, y: 55, size: 16 },
        { x: 88, y: 68, size: 10 },
        { x: 78, y: 72, size: 7 },
        { x: 85, y: 42, size: 6 },
        { x: 90, y: 80, size: 8 },
      ],
    },
    {
      id: 'eduspark',
      title: 'EduSpark',
      category: 'Brand Strategy & Web Design',
      year: '2023',
      image: 'https://images.pexels.com/photos/5428003/pexels-photo-5428003.jpeg?auto=compress&cs=tinysrgb&w=800',
      squares: [
        { x: 4, y: 24, size: 16 },
        { x: 10, y: 36, size: 10 },
        { x: 2, y: 44, size: 7 },
        { x: 78, y: 78, size: 14 },
        { x: 84, y: 88, size: 8 },
      ],
    },
    {
      id: 'greenergy',
      title: 'Greenergy',
      category: 'Brand Strategy & Web Design',
      year: '2022',
      image: 'https://images.pexels.com/photos/2800832/pexels-photo-2800832.jpeg?auto=compress&cs=tinysrgb&w=800',
      squares: [
        { x: 82, y: 26, size: 14 },
        { x: 88, y: 38, size: 10 },
        { x: 78, y: 44, size: 7 },
        { x: 84, y: 54, size: 5 },
        { x: 90, y: 60, size: 8 },
      ],
    },
  ];

  // 12 columns x 8 rows pixel-block overlay array (96 blocks)
  pixelBlocks: PixelBlock[] = [];

  // Card runtime states
  cardStates: CardState[] = [];

  // Viewport entrance signals
  headerInView = signal(false);
  cardInView = signal<boolean[]>([false, false, false, false]);

  // Marquee Logos Configuration
  baseLogos: MarqueeLogo[] = [
    { name: 'Codecraft_', type: 'code' },
    { name: 'ennLabs', type: 'dots' },
    { name: 'GlobalBank', type: 'circle-ring' },
    { name: '45 Degrees°', type: 'arrow' },
    { name: 'AlphaWave', type: 'wave-circle' },
    { name: 'Biosynthesis', type: 'lines' },
    { name: 'Boltshift', type: 'bolt' },
    { name: 'Clandestine', type: 'plus' },
  ];

  marqueeLogos: MarqueeLogo[] = [];

  private observers: IntersectionObserver[] = [];
  private animFrameId?: number;

  ngOnInit(): void {
    // Generate 12x8 pixel blocks array with diagonal stagger delays
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 12; c++) {
        this.pixelBlocks.push({
          row: r,
          col: c,
          delayIn: (r + c) * 0.018,
          delayOut: (8 - r + (12 - c)) * 0.012,
        });
      }
    }

    // Initialize state for each card
    this.cardStates = this.caseStudies.map(() => ({
      isHovered: false,
      currX: 0,
      currY: 0,
      targetX: 0,
      targetY: 0,
    }));

    // Duplicate logos for seamless infinite marquee loop (16 total items)
    this.marqueeLogos = [...this.baseLogos, ...this.baseLogos];
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObservers();
    this.startAnimationLoop();
  }

  ngOnDestroy(): void {
    this.observers.forEach((obs) => obs.disconnect());
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateParallaxScrollProgress();
  }

  private updateParallaxScrollProgress(): void {
    if (!this.sectionRef) return;
    const rect = this.sectionRef.nativeElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate scroll progress from start-end to end-start
    const totalDistance = rect.height + windowHeight;
    const currentDistance = windowHeight - rect.top;
    const progress = Math.min(Math.max(currentDistance / totalDistance, 0), 1);

    // Calculate target parallax for each top square: parallaxY = scrollProgress * -(80 + index * 30)
    for (let i = 0; i < 8; i++) {
      this.targetParallaxY[i] = progress * -(80 + i * 30);
    }
  }

  private startAnimationLoop(): void {
    const loop = () => {
      // 1. Smooth lerp for top squares scroll parallax
      for (let i = 0; i < 8; i++) {
        this.topParallaxY[i] += (this.targetParallaxY[i] - this.topParallaxY[i]) * 0.12;
      }

      // 2. Smooth spring-like lerp for card magnetic squares
      for (let i = 0; i < this.cardStates.length; i++) {
        const state = this.cardStates[i];
        state.currX += (state.targetX - state.currX) * 0.15;
        state.currY += (state.targetY - state.currY) * 0.15;
      }

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private setupIntersectionObservers(): void {
    // Header Observer
    if (this.headerRef) {
      const headerObs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.headerInView.set(true);
            headerObs.disconnect();
          }
        },
        { rootMargin: '-60px' }
      );
      headerObs.observe(this.headerRef.nativeElement);
      this.observers.push(headerObs);
    }

    // Cards Observers
    const cardEls = this.sectionRef.nativeElement.querySelectorAll('.case-study-card');
    cardEls.forEach((el, index) => {
      const cardObs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.cardInView.update((current) => {
              const updated = [...current];
              updated[index] = true;
              return updated;
            });
            cardObs.disconnect();
          }
        },
        { rootMargin: '-40px' }
      );
      cardObs.observe(el);
      this.observers.push(cardObs);
    });
  }

  // Pointer event handlers for Magnetic Squares inside cards
  onCardPointerEnter(index: number): void {
    this.cardStates[index].isHovered = true;
  }

  onCardPointerMove(event: PointerEvent, index: number, cardEl: HTMLElement): void {
    const rect = cardEl.getBoundingClientRect();
    const px = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const py = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);

    // Movement multiplier: dist * 40
    this.cardStates[index].targetX = (px - 0.5) * 40;
    this.cardStates[index].targetY = (py - 0.5) * 40;
  }

  onCardPointerLeave(index: number): void {
    this.cardStates[index].isHovered = false;
    this.cardStates[index].targetX = 0;
    this.cardStates[index].targetY = 0;
  }
}
