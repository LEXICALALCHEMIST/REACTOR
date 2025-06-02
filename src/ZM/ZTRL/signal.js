import { send } from './send.js';
import { receive } from './receive.js';

export class Signal {
  constructor() {
    console.log('Signal: Initialized API request dispatcher');
  }

  // Dispatch a send request (for SendCube)
  async sendRequest(sendObject, currentSKEL) {
    try {
      console.log('Signal: Dispatching send request');
      const { morphOp, newSkeletonJson } = await send(sendObject, currentSKEL);
      console.log('Signal: Send request processed - MorphOp:', morphOp, 'New Skeleton JSON:', newSkeletonJson);
      return { morphOp, newSkeletonJson };
    } catch (error) {
      console.error('Signal: Send request failed:', error.message);
      throw error;
    }
  }

  // Dispatch a receive request (for ReceiveCube)
  async receiveRequest(sendObject) {
    try {
      console.log('Signal: Dispatching receive request');
      const morphOp = await receive(sendObject);
      console.log('Signal: Receive request processed - MorphOp:', morphOp);
      return morphOp;
    } catch (error) {
      console.error('Signal: Receive request failed:', error.message);
      throw error;
    }
  }
}