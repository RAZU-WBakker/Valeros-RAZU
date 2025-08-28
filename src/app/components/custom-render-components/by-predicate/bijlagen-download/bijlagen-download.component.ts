import { NgIf } from '@angular/common';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { HopLinkComponent } from '../../../features/node/node-render-components/predicate-render-components/hop-components/hop-link/hop-link.component';
import { PredicateRenderComponent } from '../predicate-render-component.directive';

@Component({
  selector: 'app-bijlagen-download',
  imports: [HopLinkComponent, NgIf],
  templateUrl: './bijlagen-download.component.html',
  styleUrl: './bijlagen-download.component.css'
})
export class BijlagenDownloadComponent extends PredicateRenderComponent implements OnInit, OnChanges {
  url = '';

  ngOnInit(): void {
    this.setUrlFromData();

  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.setUrlFromData();
  }

  private setUrlFromData() {
    // PredicateRenderComponentInput.value carries the literal/IRI
    this.url = this.data?.value ?? '';
  }
}
