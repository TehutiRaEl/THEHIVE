/**
 * World Manager Implementation for THEHIVE
 */

import { WorldManager as WorldManagerInterface } from './types';

export class WorldManager implements WorldManagerInterface {
  constructor() {}
}

export const worldManager = new WorldManager();