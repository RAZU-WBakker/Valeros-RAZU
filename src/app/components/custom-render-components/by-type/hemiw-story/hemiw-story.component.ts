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
import { SparqlService } from '../../../../services/sparql.service';

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
    associatedMedia: Array<{ url: string; name?: string }> = [];

    // UI state
    showCopyrightInfo = false;

    // Explicitly declare data property from parent class for template access
    override data?: TypeRenderComponentInput;



    constructor(public fileRenderService: FileRenderService, public urlService: UrlService, public sparql: SparqlService) {
        super();
    }
    //
    ngOnInit(): void {
        this.loading = true;
        console.log(this.data?.node);
        // existing code...
        const documentUrl = this.data?.node?.['@id']?.[0]?.value;
        if (documentUrl) {
            this.urlService.proxyUrl(documentUrl).then(url => {
                this.documentUrl = url;
            });
        }

        // Fetch associatedMedia file URLs and names via SPARQL (handles blank nodes)
        const subjectId = this.data?.node?.['@id']?.[0]?.value;
        if (subjectId) {
            this.sparql
                .getAssociatedMediaFilesWithNames(subjectId)
                .then(async (items) => {
                    const proxied = await Promise.all(
                        items
                            .filter((i) => !!i.file)
                            .map(async (i) => ({
                                url: await this.urlService.proxyUrl(i.file),
                                name: i.name,
                            }))
                    );
                    this.associatedMedia = proxied;
                })
                .catch((e) => console.warn('Failed to fetch associatedMedia files with names', e))
                .finally(() => (this.loading = false));
        } else {
            this.loading = false;
        }
    }


    protected readonly featherHelpCircle = featherHelpCircle;
}