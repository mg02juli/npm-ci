/**
 * @fileoverview An Algolia search box.
 */

import {html} from "lit-element";
import {BaseElement} from "../BaseElement";
import {router} from "../../router";
import algoliasearch from "algoliasearch/dist/algoliasearchLite";

const applicationID = "2JPAZHQ6K7";
const apiKey = "01ca870a3f1cad9984ed72419a12577c";
const indexName = "webdev";
const client = algoliasearch(applicationID, apiKey);
const index = client.initIndex(indexName);

// TODO:
// - clicking a link should work :P
// - aria-activedescendant
// - aria-setsize and posinset?
// - search on more than just title

/**
 * An Algolia search box.
 * @extends {BaseElement}
 * @final
 */
class Search extends BaseElement {
  static get properties() {
    return {
      expanded: {type: Boolean, reflect: true},
      hits: {type: Object},
      showHits: {type: Boolean},
      cursor: {type: Number},
    };
  }

  constructor() {
    super();
    this.hits = [];
    this.showHits = false;
    this.cursor = -1;
  }

  onKeyUp(e) {
    switch (e.key) {
      case "Home":
        this.firstHit();
        return;

      case "End":
        this.lastHit();
        return;

      case "ArrowUp":
        this.prevHit();
        return;

      case "ArrowDown":
        this.nextHit();
        return;

      case "Enter":
        this.navigateToHit();
        return;

      case "Escape":
        document.activeElement.blur();
        return;
    }

    const query = e.target.value;
    if (query === "") {
      this.hits = [];
      return;
    }
    (async () => {
      try {
        const {hits} = await index.search({query, hitsPerPage: 10});
        this.hits = hits;
      } catch (err) {
        console.log(err);
        console.log(err.debugData);
      }
    })();
  }

  firstHit() {
    this.cursor = 0;
  }

  lastHit() {
    this.cursor = this.hits.length - 1;
  }

  nextHit() {
    if (this.cursor === -1) {
      this.cursor = 0;
      return;
    }
    this.cursor = (this.cursor + 1) % this.hits.length;
    setTimeout(() => {
      this.querySelector(".web-search-popout__link--active").scrollIntoView();
    }, 0);
  }

  prevHit() {
    if (this.cursor === -1) {
      this.cursor = this.hits.length - 1;
      return;
    }
    this.cursor = (this.cursor - 1 + this.hits.length) % this.hits.length;
    setTimeout(() => {
      this.querySelector(".web-search-popout__link--active").scrollIntoView();
    }, 0);
  }

  navigateToHit() {
    const {url} = this.hits[this.cursor];
    router.route(url);
    document.activeElement.blur();
  }

  onFocus() {
    // this.dispatchEvent(new CustomEvent("expand"));
    this.expanded = true;
    document.addEventListener(this.onScroll, {passive: true, once: true});
    setTimeout(() => {
      document.querySelector(".web-header__middle").style.overflow = "visible";
      document.querySelector(".web-header__links").style.visibility = "hidden";
      this.showHits = true;
    }, 200);
  }

  onBlur() {
    // this.dispatchEvent(new CustomEvent("collapse"));
    document.querySelector(".web-header__middle").style.overflow = "hidden";
    document.querySelector(".web-header__links").style.visibility = "visible";
    this.expanded = false;
    this.showHits = false;
    this.cursor = -1;
  }

  onScroll() {
    document.activeElement.blur();
  }

  render() {
    return html`
      <input
        class="web-search__input"
        type="text"
        autocomplete="off"
        role="search"
        @keyup=${this.onKeyUp}
        @focus=${this.onFocus}
        @blur=${this.onBlur}
      />
      ${this.hitsTemplate}
    `;
  }

  /* eslint-disable indent */
  get hitsTemplate() {
    return html`
      ${this.hits && this.hits.length && this.showHits
        ? html`
            <div class="web-search-popout">
              <div class="web-search-popout__heading">Pages</div>
              <ul class="web-search-popout__list">
                ${this.hits.map(
                  (hit, idx) => html`
                    <li class="web-search-popout__item">
                      <a
                        class="web-search-popout__link ${idx === this.cursor
                          ? "web-search-popout__link--active"
                          : ""}"
                        href="${hit.url}"
                        >${hit.title}</a
                      >
                    </li>
                  `,
                )}
              </ul>
            </div>
          `
        : ""}
    `;
  }
}

customElements.define("web-search", Search);
