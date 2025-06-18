import axios from 'axios';
import Ignite from './ignite.js';

export class Signal {
  constructor() {
    this.axios = axios.create({ baseURL: 'http://localhost:3001' });
  }

  async onLogin(user) {
    try {
      const response = await this.axios.get('/morph/pending', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const morphOps = response.data.morphOps;
      const ignite = new Ignite(user);
      return await ignite.processMorphOps(morphOps);
    } catch (error) {
      throw new Error(`Signal: Failed to fetch morphOps: ${error.message}`);
    }
  }
}