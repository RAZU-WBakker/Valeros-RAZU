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
    selector: 'app-render-tab-with-doc-viewer',
    imports: [NgIf, DocViewerComponent, NodeTableViewComponent],
    templateUrl: './render-tab-with-doc-viewer.component.html',
    styleUrls: ['./render-tab-with-doc-viewer.component.css']
})
export class RenderTabWithDocViewerComponent extends TypeRenderComponent implements OnInit {
    // Arrays to store IDs retrieved from hop-link components
    public FileType = FileType;
    shownInTableCell = true;
    @Output() hasViewer = new EventEmitter<boolean>();
    // Loading state
    loading = false;
    buildinghistoryPDF = '';
    peoplehistoryPDF = '';

    // UI state
    showCopyrightInfo = false;

    associatedMedia: Array<{ url: string; name?: string }> = [];

    // Explicitly declare data property from parent class for template access
    override data?: TypeRenderComponentInput;



    constructor(public fileRenderService: FileRenderService, public urlService: UrlService, public sparql: SparqlService) {
        super();
    }
    //
    ngOnInit(): void {
        this.loading = true;
        console.log(this.data);
        const bouwgeschiedenisIri = 'https://huizenenmenseninwijk.nl/def/hemiw/bouwgeschiedenis';
        const rawUrlBuildingHistory = this.data?.node?.[bouwgeschiedenisIri]?.[0]?.value;

        if (rawUrlBuildingHistory) {
            console.log('[RenderTab] Raw building history URL:', rawUrlBuildingHistory);
            this.urlService.proxyUrl(rawUrlBuildingHistory).then(url => {
                console.log('[RenderTab] Proxied building history URL:', url);
                this.buildinghistoryPDF = url;
            });
        } else {
            console.warn('No bouwgeschiedenis URL on node:', this.data?.node);
        }
        const peoplehistoryIri = 'https://huizenenmenseninwijk.nl/def/hemiw/mensengeschiedenis';
        const rawUrlPeopleHistory = this.data?.node?.[peoplehistoryIri]?.[0]?.value;

        if (rawUrlPeopleHistory) {
            console.log('[RenderTab] Raw people history URL:', rawUrlPeopleHistory);
            this.urlService.proxyUrl(rawUrlPeopleHistory).then(url => {
                console.log('[RenderTab] Proxied people history URL:', url);
                this.peoplehistoryPDF = url;
            });
        } else {
            console.warn('No peoplehistory URL on node:', this.data?.node);
        }
        const subjectId = this.data?.node?.['@id']?.[0]?.value;
        if (subjectId) {
            this.sparql
                .getAssociatedMediaFilesWithNames(subjectId)
                .then(async (items) => {
                    console.log('[RenderTab] Associated media items:', items);
                    const proxied = await Promise.all(
                        items
                            .filter((i) => !!i.file)
                            .map(async (i) => {
                                const proxiedUrl = await this.urlService.proxyUrl(i.file);
                                console.log('[RenderTab] Media file proxied:', i.file, '->', proxiedUrl);
                                return {
                                    url: proxiedUrl,
                                    name: i.name,
                                };
                            })
                    );
                    this.associatedMedia = proxied;
                })
                .catch((e) => console.warn('Failed to fetch associatedMedia files with names', e))
                .finally(() => (this.loading = false));
        } else {
            this.loading = false;
        }
        this.loading = false;
    }


    protected readonly featherHelpCircle = featherHelpCircle;
}