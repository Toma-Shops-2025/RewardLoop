import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import fs from 'fs';
const png = PNG.sync.read(fs.readFileSync('src/assets/qr-rewardloop.png'));
const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
console.log('decoded:', code?.data);
