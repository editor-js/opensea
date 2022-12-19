/**
 * Import styles library
 */
import styles from './index.module.css';

/**
 * Import types
 */
import { OpenseaToolData, OpenseaToolConfig } from './types';
import { API, BlockTool, PasteConfig, PatternPasteEvent } from '@editorjs/editorjs';

/**
 * opensea Tool for Editor.js
 */
export default class OpenseaTool implements BlockTool {
  /**
   * Code API — public methods to work with Editor
   * 
   * @link https://editorjs.io/api
   */
  private readonly api: API;

  /**
   * Read-only mode flag
   */
  private readonly readOnly: boolean;

  /**
   * Tool data for input and output
   */
  private data: OpenseaToolData;

  /**
   * Configuration object that passed through the initial Editor configuration.
   */
  private config: OpenseaToolConfig;

  /**
   * Tool's HTML nodes
   */
  private nodes: {[key: string]: HTMLElement|null};

  /**
   * Class constructor
   */
  constructor({ data, config, api, readOnly }: { data: OpenseaToolData, config: OpenseaToolConfig, api: API, readOnly: boolean }) {
    this.data = data;
    this.config = config;
    this.api = api;
    this.readOnly = readOnly;

    /**
     * Declare Tool's nodes
     */
    this.nodes = {
      wrapper: null,
      nftCard: null,
    };
  }

  /**
   * Before usage of the Tool, it should be prepared
   */
  static prepare(): void {
    /**
     * Script URL for an embeddable NFT card
     * Required only in this method
     */
    const scriptUrl = 'https://unpkg.com/embeddable-nfts/dist/nft-card.min.js';

    /**
     * Add script file only once
     */
    const scriptElement = document.querySelector(`script[src="${scriptUrl}"]`);

    if (!scriptElement) {
      const script = document.createElement('script');

      script.src = scriptUrl;

      document.head.appendChild(script);
    }
  }

  /**
   * Creates UI of a Block
   */
  render(): HTMLElement {
    this.nodes.wrapper = document.createElement('div');
    this.nodes.wrapper.classList.add(styles['opensea-tool']);

    /**
     * If data is passed, render NFT card
     */ 
    if (this.data.contractAddress && this.data.tokenId) {
      this.renderNftCard();
    }

    return this.nodes.wrapper;
  }

  /**
   * Extracts Block data from the UI
   */
  save(): OpenseaToolData {
    return this.data;
  }

  /**
   * Handle content pasted by ways that described by pasteConfig static getter
   */  
  onPaste(event: PatternPasteEvent) {
    const { data } = event.detail;
    const groups = data.match(OpenseaTool.regexp);

    /**
     * If data is not a valid link, show message and do nothing
     */
    if (!groups || groups.length < 4) {
      this.api.notifier.show({
        message: 'Bad opensea item URL',
        style: 'error',
      });
      return;
    }

    /**
     * Save data to the Tool's data
     */
    this.data = {
      coin: groups[1],
      contractAddress: groups[2],
      tokenId: groups[3],
    };

    this.renderNftCard();
  }

  /**
   * Process pasted content before appending to the Editor
   */ 
  static get pasteConfig(): PasteConfig {
    return {
      patterns: {
        opensea: OpenseaTool.regexp,
      }
    };
  }

  /**
   * Notify core that read-only mode is suppoorted
   */
  static get isReadOnlySupported(): boolean {
    return true;
  }

  /**
   * Regexp for a opensea link
   */
  private static get regexp(): RegExp {
    return /^https:\/\/opensea\.io\/assets\/([a-zA-Z]+)\/([A-Za-z0-9]+)\/([A-Za-z0-9]+)$/i;
  }

  /**
   * Render NFT card into the wrapper
   */
  private renderNftCard(): void {
    /**
     * Create NFT card element
     */
    this.nodes.nftCard = document.createElement('nft-card');
    this.nodes.nftCard.setAttribute('contractAddress', this.data.contractAddress);
    this.nodes.nftCard.setAttribute('tokenId', this.data.tokenId);

    /**
     * Append NFT card to the wrapper
     */
    if (this.nodes.wrapper) {
      this.nodes.wrapper.innerHTML = '';
      this.nodes.wrapper.appendChild(this.nodes.nftCard);
    } else {
      this.api.notifier.show({
        message: 'Wrapper is not initialized',
        style: 'error',
      });
    }
  }
};