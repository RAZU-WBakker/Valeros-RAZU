import { NgIf } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../config/settings';
import { MiradorComponent } from '../../file-viewers/mirador/mirador.component';
import { ImageViewerComponent } from "../../file-viewers/image-viewer/image-viewer";

@Component({
  selector: 'app-node-images',
  imports: [NgIf, MiradorComponent, ImageViewerComponent],
  templateUrl: './node-images.component.html',
  styleUrl: './node-images.component.css'
})
export class NodeImagesComponent implements OnChanges, AfterViewInit {
  @Input() imageUrls?: string[];
  @Input() shownInTableCell = true;
  @Input() useViewer = true;
  @Input() imageLabel?: string;
  private readonly iiifServer = 'https://iiif.razu.nl/iiif/2';
  private readonly bucket = 't01';

  thumbLoaded = false;
  @ViewChild('thumbImg') imgRef?: ElementRef<HTMLImageElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageUrls']) {
      this.thumbLoaded = false;
      // In case the new URL is cached and load doesn't fire, re-check after DOM updates
      setTimeout(() => this.checkIfImageAlreadyLoaded());
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
  // Build IIIF proxy base for a given original image URL
  private iiifBase(originalUrl: string): string {
    const filename = (originalUrl?.split('%2F').pop() || '').trim();
    return `${this.iiifServer}/${this.bucket}__${filename}`;
  }

  // 200px thumbnail variant (kept for potential future use)
  getThumbUrl(originalUrl: string): string {
    if (!originalUrl) return '';
    return `${this.iiifBase(originalUrl)}/full/200,/0/default.jpg`;
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
}

