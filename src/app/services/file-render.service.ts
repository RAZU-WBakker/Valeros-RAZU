import { Injectable } from '@angular/core';
import { Settings } from '../config/settings';
import { FileType } from '../models/file-type.model';
import { SparqlService } from './sparql.service';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root',
})
export class FileRenderService {
  constructor(
    private urlService: UrlService,
    private sparql: SparqlService,
  ) { }

  getThumbImageUrl(url: string, fileType: FileType): string {
    if (fileType === FileType.WEB_IMAGE) {
      // For external images, use proxy if configured to avoid CORS/ORB blocking in list views
      const proxy = Settings.endpoints.proxyUrl;
      if (proxy) {
        try {
          const u = new URL(url, window.location.origin);
          const isCrossOrigin = u.origin !== window.location.origin;
          if (isCrossOrigin) {
            return `${proxy}?url=${encodeURIComponent(url)}`;
          }
        } catch {
          // If URL parsing fails, fall back to proxying
          return `${proxy}?url=${encodeURIComponent(url)}`;
        }
      }
      return url;
    }

    const fileIconUrl = Settings.fileRendering.fileTypes[fileType]?.iconUrl;
    const unknownIconUrl =
      Settings.fileRendering.fileTypes[FileType.UNKNOWN].iconUrl;
    return fileIconUrl ?? unknownIconUrl;
  }

  getFileType(url: string): FileType {
    if (!url) return FileType.UNKNOWN;

    const urlWithoutParams = url.split('?')[0];
    const fileExtension = urlWithoutParams.split('.').pop()?.toLowerCase();

    if (!fileExtension) return FileType.UNKNOWN;

    for (const [fileType, config] of Object.entries(
      Settings.fileRendering.fileTypes,
    )) {
      if (config.extensions.includes(fileExtension)) {
        return fileType as FileType;
      }
    }

    return FileType.UNKNOWN;
  }

  async processUrls(
    inputUrls: string | string[],
    hopPreds?: string[],
  ): Promise<string[]> {
    const urls = Array.isArray(inputUrls) ? inputUrls : [inputUrls];
    const validUrls = urls.filter((url) => url);

    if (validUrls.length === 0) {
      return [];
    }

    let unprocessedUrls: string[];
    if (hopPreds && hopPreds.length > 0) {
      const urlPromises = validUrls.map((url) =>
        this.sparql.getObjIds(url, hopPreds),
      );
      const results = await Promise.all(urlPromises);
      unprocessedUrls = results.flat();
    } else {
      unprocessedUrls = validUrls;
    }

    const fileUrls = await Promise.all(
      unprocessedUrls.map((url) => this.urlService.processUrl(url, false)),
    );

    return fileUrls;
  }
}
