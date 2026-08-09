import { Component, ElementRef, OnInit, OnDestroy, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import esriConfig from '@arcgis/core/config';
import { defineCustomElements } from '@arcgis/map-components/dist/loader';
import { defineCustomElements as defineCalciteCustomElements } from '@esri/calcite-components/dist/loader';
import { HeaderComponent } from '../../ui/header/header.component';
import { NavButtonsComponent } from "../../ui/nav-buttons/nav-buttons.component";

@Component({
    selector: 'app-map',
    imports: [CommonModule, HeaderComponent, NavButtonsComponent],
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapComponent implements OnInit, OnDestroy {
    @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
    loading = true;
    error = false;
    view: MapView | null = null;

    ngOnInit(): void {
        // Define ArcGIS web components and Calcite components (used internally by ArcGIS components)
        defineCustomElements(window);
        defineCalciteCustomElements(window);
        this.initializeMap();
    }

    ngOnDestroy(): void {
        if (this.view) {
            // Destroy the map view when the component is destroyed
            this.view.destroy();
        }
    }

    initializeMap(): void {
        this.loading = true;
        this.error = false;

        try {
            // Configure ArcGIS to use assets from the correct path
            esriConfig.assetsPath = '/assets/arcgis';

            // Use the WebMap from the ArcGIS sidebar app
            const webmap = new WebMap({
                portalItem: {
                    id: 'e18c7c66b3da441199d5b3334890016a'
                }
            });

            // Create a map view with the web map
            this.view = new MapView({
                container: this.mapViewEl.nativeElement,
                map: webmap,
                padding: {
                    top: 50,
                    bottom: 0,
                    left: 0,
                    right: 0
                }
            });

            // When the view is ready, hide the loading indicator
            this.view.when(() => {
                this.loading = false;
                console.log('Map loaded successfully');

                // Programmatically control expand states after components are ready
                setTimeout(() => {
                    const legendExpand = document.querySelector('.legend-expand') as any;
                    const layerListExpand = document.querySelector('.layer-list-expand') as any;

                    if (legendExpand) {
                        legendExpand.expanded = true;
                    }
                    if (layerListExpand) {
                        layerListExpand.expanded = false;
                    }
                }, 100);
            }, (error: any) => {
                console.error('Error loading map:', error);
                this.loading = false;
                this.error = true;
            });
        } catch (err) {
            console.error('Error initializing map:', err);
            this.loading = false;
            this.error = true;
        }
    }
}
