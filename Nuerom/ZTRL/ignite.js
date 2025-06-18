import axios from 'axios';
import { ReceiveCube } from '../MORPHCUBE/rCUBE.js';

export class Ignite {
  constructor(user) {
    this.user = user;
    this.axios = axios.create({ baseURL: 'http://localhost:3001' });
  }

  async processMorphOps(morphOps) {
    try {
      const cube = new ReceiveCube(this.user);
      const { currentSKEL, newSkeletonJson, pom } = await cube.processMorphOps(morphOps);
      this.user.currentSKEL = currentSKEL;
      await this.updateMorphStatus(pom);
      return { currentSKEL, newSkeletonJson };
    } catch (error) {
      throw new Error(`Ignite: Failed to process morphOps: ${error.message}`);
    }
  }

  async updateMorphStatus(pom) {
    await this.axios.post('/morph/update', { pom }, {
      headers: { Authorization: `Bearer ${this.user.token}` }
    });
  }
}