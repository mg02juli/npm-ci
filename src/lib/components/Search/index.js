/**
 * @fileoverview An Algolia search box.
 */

import {html} from "lit-element";
import {BaseElement} from "../BaseElement";
import algoliasearch from "algoliasearch/dist/algoliasearchLite";

const applicationID = "2JPAZHQ6K7";
const apiKey = "01ca870a3f1cad9984ed72419a12577c";
const indexName = "webdev";
const client = algoliasearch(applicationID, apiKey);
const index = client.initIndex(indexName);

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
    };
  }

  constructor() {
    super();
    this.hits = [];
  }

  onKeyUp(e) {
    const query = e.target.value;
    (async () => {
      try {
        const {hits} = await index.search({query});
        this.hits = hits;
      } catch (err) {
        console.log(err);
        console.log(err.debugData);
      }
    })();
  }

  onFocus() {
    this.dispatchEvent(new CustomEvent("expand"));
    this.expanded = true;
  }

  onBlur() {
    this.dispatchEvent(new CustomEvent("collapse"));
    this.expanded = false;
  }

  render() {
    return html`
      <div>
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
      </div>
    `;
  }

  /* eslint-disable indent */
  get hitsTemplate() {
    return html`
      ${this.hits.length
        ? html`
            <ul>
              ${this.hits.map(
                (hit) => html`
                  <li>
                    <a href="${hit.url}">${hit.title}</a>
                  </li>
                `,
              )}
            </ul>
          `
        : ""}
    `;
  }
}

customElements.define("web-search", Search);
