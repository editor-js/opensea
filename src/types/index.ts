import { BlockToolData, ToolConfig } from '@editorjs/editorjs';

/**
 * OpenseaTool Tool's input and output data format
 */
export interface OpenseaToolData extends BlockToolData {
  /**
   * Coin 
   */
  coin: string;
  
  /**
   * The token's contract address
   */
  contractAddress: string;

  /**
   * The token Id of the asset.
   */
  tokenId: string;
}

/**
 * OpenseaTool Tool's configuration object that passed through the initial Editor config
 */
export interface OpenseaToolConfig extends ToolConfig {}