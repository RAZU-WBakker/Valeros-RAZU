import { NgIf } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../../../config/settings';
import { MiradorComponent } from '../../file-viewers/mirador/mirador.component';

@Component({
    selector: 'app-image-viewer',
    imports: [NgIf, MiradorComponent],
    templateUrl: './image-viewer.html',
    styleUrl: './image-viewer.css'
})
export class ImageViewerComponent implements OnChanges, AfterViewInit {
    @Input() imageUrls?: string[];
    @Input() imageLabel?: string;

    // Index of the currently shown image in the carousel
    currentIndex = 0;

    // Desired display width in pixels for IIIF-delivered images
    private readonly displayWidth = 2000;
    private readonly iiifServer = 'https://iiif.razu.nl/iiif/2';
    private readonly bucket = 't01';
    private readonly fallbackInfoWidth = 200; // safe request before info.json is known

    // Cache of info.json results per original URL
    private infoCache = new Map<string, { width: number; height: number }>();

    thumbLoaded = false;
    @ViewChild('thumbImg') imgRef?: ElementRef<HTMLImageElement>;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['imageUrls']) {
            this.thumbLoaded = false;
            // Reset or clamp index when images change
            if (!this.imageUrls || this.imageUrls.length === 0) {
                this.currentIndex = 0;
            } else if (this.currentIndex >= this.imageUrls.length) {
                this.currentIndex = 0;
            }
            // In case the new URL is cached and load doesn't fire, re-check after DOM updates
            setTimeout(() => this.checkIfImageAlreadyLoaded());

            // Preload IIIF info.json to know the maximum intrinsic width
            this.preloadInfo();
        }
    }

    ngAfterViewInit(): void {
        this.checkIfImageAlreadyLoaded();
    }

    onImageLoadError(event: Event) {
        const imgElement = event.target as HTMLImageElement;
        imgElement.src = Settings.ui.imageForWhenLoadingFails;
        this.thumbLoaded = true; // hide skeleton even if fallback
    }

    onImageLoad() {
        this.thumbLoaded = true;
    }

    private checkIfImageAlreadyLoaded() {
        const img = this.imgRef?.nativeElement;
        if (img && img.complete && img.naturalWidth > 0) {
            this.thumbLoaded = true;
        }
    }

    // Preload info.json for all images in the list (best-effort)
    private preloadInfo() {
        if (!this.imageUrls?.length) return;
        for (const url of this.imageUrls) {
            // Skip if already cached
            if (this.infoCache.has(url)) continue;
            this.fetchInfoFor(url);
        }
    }

    private async fetchInfoFor(originalUrl: string) {
        try {
            const response = await fetch(`${this.iiifBase(originalUrl)}/info.json`, {
                headers: { 'Accept': 'application/json' },
            });
            if (!response.ok) throw new Error(`info.json HTTP ${response.status}`);
            const info = await response.json();
            const width = Number(info?.width) || this.fallbackInfoWidth;
            const height = Number(info?.height) || this.fallbackInfoWidth;
            this.infoCache.set(originalUrl, { width, height });
        } catch (_e) {
            // Keep a conservative fallback to avoid denial
            this.infoCache.set(originalUrl, { width: this.fallbackInfoWidth, height: this.fallbackInfoWidth });
        }
    }

    // Build IIIF proxy base for a given original image URL
    private iiifBase(originalUrl: string): string {
        const filename = (originalUrl?.split('/').pop() || '').trim();
        return `${this.iiifServer}/${this.bucket}__${filename}`;
    }

    // Full image suitable for screen viewing (limited width for performance)
    getDisplayUrl(originalUrl: string): string {
        if (!originalUrl) return '';
        const intrinsic = this.infoCache.get(originalUrl)?.width ?? this.fallbackInfoWidth;
        const reqWidth = Math.max(1, Math.min(this.displayWidth, intrinsic));
        return `${this.iiifBase(originalUrl)}/full/${reqWidth},/0/default.jpg`;
    }

    // 200px thumbnail variant (kept for potential future use)
    getThumbUrl(originalUrl: string): string {
        if (!originalUrl) return '';
        return `${this.iiifBase(originalUrl)}/full/200,/0/default.jpg`;
    }

    // Navigation controls for the viewer
    next() {
        if (!this.imageUrls?.length) return;
        this.currentIndex = (this.currentIndex + 1) % this.imageUrls.length;
    }

    prev() {
        if (!this.imageUrls?.length) return;
        const len = this.imageUrls.length;
        this.currentIndex = (this.currentIndex - 1 + len) % len;
    }

    // Keyboard navigation (works globally)
    @HostListener('window:keydown', ['$event'])
    handleKeydown(event: KeyboardEvent) {
        if (!this.imageUrls?.length) return;
        switch (event.key) {
            case 'ArrowRight':
            case 'd':
                this.next();
                event.preventDefault();
                break;
            case 'ArrowLeft':
            case 'a':
                this.prev();
                event.preventDefault();
                break;
            case 'Home':
                this.currentIndex = 0;
                event.preventDefault();
                break;
            case 'End':
                this.currentIndex = this.imageUrls.length - 1;
                event.preventDefault();
                break;
        }
    }

    // Explicit selection from thumbnails
    select(index: number) {
        if (!this.imageUrls?.length) return;
        if (index < 0 || index >= this.imageUrls.length) return;
        this.currentIndex = index;
    }
}
