import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  type OnInit,
} from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { finalize } from 'rxjs/operators';
import { Settings } from '../../../../config/settings';
import { FileType } from '../../../../models/file-type.model';

@Component({
  selector: 'app-doc-viewer',
  imports: [PdfJsViewerModule],
  templateUrl: './doc-viewer.component.html',
  styleUrl: './doc-viewer.component.css',
})
export class DocViewerComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() url?: string;
  @Input() fileType?: FileType;
  @ViewChild('pdfViewer') pdfViewer: any;
  @Output() error = new EventEmitter<Error>();
  isConvertingPDF = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    if (this.pdfViewer) {
      this.pdfViewer.viewerFolder = '/assets/pdfjs';
      this.pdfViewer.externalWindow = false;
      console.log('[DocViewer] ngAfterViewInit - set viewerFolder:', this.pdfViewer.viewerFolder);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['url']) {
      this.initPdfViewer();
    }
  }

  initPdfViewer() {
    console.log('Initializing PDF viewer...');
    console.log('[DocViewer] Input url:', this.url);
    console.log('[DocViewer] File type:', this.fileType);

    const pdfUrl: string | null = this._getPdfUrl();
    console.log('[DocViewer] Resolved PDF URL:', pdfUrl);
    if (!pdfUrl) {
      this.error.emit(new Error('No PDF URL found'));
      return;
    }

    // TODO: If file type is PDF, bypass Gotenberg and set pdfSrc directly to PDF contents
    // For now, keeping Gotenberg in there as a quick way to get file contents (PDF viewer seems to need PDF content, not a URL)
    this.isConvertingPDF = true;
    this.http
      .get(pdfUrl, { responseType: 'blob' })
      .pipe(
        finalize(() => {
          this.isConvertingPDF = false;
        }),
      )
      .subscribe({
        next: (result) => {
          console.log('[DocViewer] PDF blob loaded, size:', result.size, 'type:', result.type);
          console.log('[DocViewer] pdfViewer element:', this.pdfViewer);
          // Set viewer folder before assigning pdfSrc
          this.pdfViewer.viewerFolder = '/assets/pdfjs';
          console.log('[DocViewer] Set viewerFolder to:', this.pdfViewer.viewerFolder);
          this.pdfViewer.pdfSrc = result;
          this.pdfViewer.refresh();
          console.log('[DocViewer] refresh() called');
        },
        error: (error) => {
          console.error('[DocViewer] Error loading PDF blob:', error);
          this.error.emit(error);
        },
      });
  }

  private _getPdfUrl(): string | null {
    if (!this.url || !this.fileType) return null;

    if (this.fileType === FileType.PDF) {
      // TODO: Fix CORS issues on localhost / dev without corsproxy
      const isLocalhost = window.location.hostname === 'localhost';
      return this.url;
      // return isLocalhost
      //   ? 'https://corsproxy.io/?url=' + encodeURIComponent(this.url)
      //   : this.url;
    }

    if (!Settings.endpoints.pdfConversionUrl) {
      console.warn(
        'No PDF conversion URL found, add one in the endpoint settings.',
      );
      return null;
    }
    return Settings.endpoints.pdfConversionUrl + encodeURIComponent(this.url);
  }
}
