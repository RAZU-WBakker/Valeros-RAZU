import { NgIf } from '@angular/common';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { TypeRenderComponent } from '../type-render-component.component';
import { TypeRenderComponentInput } from '../../../../models/type-render-component-input.model';
import { registerLocaleData } from '@angular/common';
import localeNl from '@angular/common/locales/nl';
import { featherHelpCircle } from '@ng-icons/feather-icons';
import { DocViewerComponent } from "../../../features/file-viewers/doc-viewer/doc-viewer.component";
import { FileRenderService } from '../../../../services/file-render.service';
import { NodeTableViewComponent } from "../../../features/node/node-render-components/node-table-view/node-table-view.component";
import { UrlService } from '../../../../services/url.service';
import { FileType } from '../../../../models/file-type.model';

// Register Dutch locale
registerLocaleData(localeNl);

@Component({
    selector: 'app-hemiw-story',
    imports: [NgIf, DocViewerComponent, NodeTableViewComponent],
    templateUrl: './hemiw-story.component.html',
    styleUrls: ['./hemiw-story.component.css']
})
export class HemiwStoryComponent extends TypeRenderComponent implements OnInit {
    // Arrays to store IDs retrieved from hop-link components
    public FileType = FileType;
    shownInTableCell = true;
    @Output() hasViewer = new EventEmitter<boolean>();
    // Loading state
    loading = false;
    documentUrl = '';
    associatedMediaUrls: string[] = [];

    // UI state
    showCopyrightInfo = false;

    // Explicitly declare data property from parent class for template access
    override data?: TypeRenderComponentInput;



    constructor(public fileRenderService: FileRenderService, public urlService: UrlService) {
        super();
    }
    //
    ngOnInit(): void {
        this.loading = true;

        // existing code...
        const documentUrl = this.data?.node?.['@id']?.[0]?.value;
        if (documentUrl) {
            this.urlService.proxyUrl(documentUrl).then(url => {
                this.documentUrl = url;
            });
        }

        // NEW: extract associatedMedia URLs
        const assoc = this.data?.node?.['https://schema.org/associatedMedia'] as Array<{ value?: string }> | undefined;
        const rawUrls = (assoc ?? []).map(x => x?.value).filter((v): v is string => !!v);

        // If proxying is needed:
        Promise.all(rawUrls.map(u => this.urlService.proxyUrl(u)))
            .then(urls => {
                this.associatedMediaUrls = urls;
            })
            .finally(() => (this.loading = false));
    }


    protected readonly featherHelpCircle = featherHelpCircle;
}