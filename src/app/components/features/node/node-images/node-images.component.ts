import { Component, Input } from '@angular/core';
import { Settings } from '../../../../config/settings';
import { MiradorComponent } from '../../file-viewers/mirador/mirador.component';

@Component({
  selector: 'app-node-images',
  imports: [MiradorComponent],
  templateUrl: './node-images.component.html',
  styleUrl: './node-images.component.css',
})
export class NodeImagesComponent {
  @Input() imageUrls?: string[];
  @Input() shownInTableCell = true;
  @Input() useViewer = true;
  @Input() imageLabel?: string;

  get thumbnailUrls(): string[] {
    if (!this.imageUrls) {
      return [];
    }

    // Use IIIF thumbnails when not using the viewer
    if (!this.useViewer) {
      return this.imageUrls.map((url) => this.convertToThumbnailUrl(url));
    }

    return this.imageUrls;
  }

  private convertToThumbnailUrl(imageUrl: string): string {
    // Extract filename from URL
    const filename = imageUrl.split('/').pop();
    if (!filename) {
      return imageUrl;
    }

    // Transform filename to match IIIF service pattern: t01__{filename}
    const iiifFilename = `t01__${filename}`;

    // Generate IIIF thumbnail URL using RAZU IIIF service
    return `https://iiif.razu.nl/iiif/2/${iiifFilename}/full/,512/0/default.jpg`;
  }

  onImageLoadError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = Settings.ui.imageForWhenLoadingFails;
  }
}
