/**
 * @fileoverview An Algolia search box.
 */

import {html} from "lit-element";
import {BaseElement} from "../BaseElement";
import algoliasearch from "algoliasearch/dist/algoliasearchLite";

const applicationID = "latency";
const apiKey = "249078a3d4337a8231f1665ec5a44966";
const indexName = "bestbuy";
const client = algoliasearch(applicationID, apiKey);
const index = client.initIndex(indexName);

/**
 * An Algolia search box.
 * @extends {BaseElement}
 * @final
 */
class Search extends BaseElement {
  static get properties() {
    return {hits: {type: Object}};
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

  render() {
    return html`
      <div>
        <input
          type="text"
          autocomplete="off"
          role="search"
          @keyup=${this.onKeyUp}
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
                  <li>${hit.name}</li>
                `,
              )}
            </ul>
          `
        : ""}
    `;
  }
}

customElements.define("web-search", Search);
