import { ElementRef, Injectable } from '@angular/core';
import { DetailsService } from '../details.service';
import { NodeService } from '../node/node.service';

@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  private _scrollContainer: ElementRef | undefined;

  private _lastClickedScrollId: string | null = null;

  private _scrollIdToReturnTo: string | null = null;

  private static DEBUG = true;

  constructor(
    public nodes: NodeService,
    public details: DetailsService,
  ) {
    this._initScrollOnDetailsViewChange();
  }

  initScrollContainer(scrollContainer: ElementRef) {
    this._scrollContainer = scrollContainer;
  }

  private _initScrollOnDetailsViewChange() {
    this.details.showing.subscribe((isShowing) => {
      if (!isShowing) {
        this.scrollToSearchResult();
      }
    });
  }

  saveLastClickedScrollId(scrollId: string) {
    const shouldMaintainCurrentScrollIdToReturnTo = this.details.showing.value;
    if (shouldMaintainCurrentScrollIdToReturnTo) {
      // If already on details page, maintain the original scroll ID of the search page to return to
      this._lastClickedScrollId = this._scrollIdToReturnTo ?? scrollId;
    } else {
      this._lastClickedScrollId = scrollId;
    }
  }

  onNavigateToDetails(nodeId: string) {
    if (this._lastClickedScrollId) {
      this._scrollIdToReturnTo = this._lastClickedScrollId;
      this._lastClickedScrollId = null;
    } else {
      this._scrollIdToReturnTo = encodeURIComponent(nodeId);
    }
  }

  scrollToSearchResult() {
    const idToScrollTo = this._scrollIdToReturnTo;
    // TODO: Properly wait for search results page to have completed rendering instead of using timeout "hack"
    //  Note that search results remain in the DOM when going to the details view (but invisible), therefore are not reloaded asynchronously anymore, drastically reducing the time we need to wait before initiating scroll
    setTimeout(() => {
      if (!this._scrollContainer && ScrollService.DEBUG) {
        console.warn('Scroll container is undefined (not required for window scroll)');
      }
      if (!idToScrollTo) {
        if (ScrollService.DEBUG) {
          console.log('No ID to scroll to');
        }
        return;
      }

      const searchResultElem = document.querySelector(
        `[data-scroll-id="${idToScrollTo}"]`,
      );

      if (!searchResultElem) {
        // TODO: This seems to occur after having clicked from details page to details page for a while, and then returning all the way to the search page. Maybe because of slow page rendering?
        if (ScrollService.DEBUG) {
          console.warn('Could not find scroll ID', idToScrollTo);
        }
        return;
      }
      if (ScrollService.DEBUG) {
        console.log(
          'Scrolling back to search result',
          idToScrollTo,
          searchResultElem,
        );
      }

      const targetEl = searchResultElem as HTMLElement;

      // Use double rAF to allow layout/paint to settle before measuring
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Estimate header offset from the header element if present, otherwise default to 64px (pt-16)
          const headerEl = document.querySelector('app-header') as HTMLElement | null;
          const headerOffset = Math.round(headerEl?.getBoundingClientRect().height ?? 64) + 64;

          const absoluteTop = window.scrollY + targetEl.getBoundingClientRect().top;
          if (ScrollService.DEBUG) {
            console.log('Scrolling window to', absoluteTop - headerOffset, '(headerOffset:', headerOffset, ')');
          }
          window.scrollTo({ top: absoluteTop - headerOffset, behavior: 'smooth' });

          // Clear the stored id so we don't keep trying to scroll again next time
          this._scrollIdToReturnTo = null;
        });
      });
    }, 250);
  }
}
