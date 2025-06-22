import weaver from './weaver.js';

export default function watcher(data) {
  console.log('Watcher: Captured data:', JSON.stringify(data, null, 2));
  return weaver(data);
}