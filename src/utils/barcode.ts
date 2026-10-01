// Utility to generate clean SVG barcodes and labels

export function generateBarcodeSvg(value: string, width = 240, height = 60): string {
  // Deterministic pattern generator mimicking Code 128
  const chars = value.split('');
  let bars: boolean[] = [true, false, true, false]; // start guard
  
  for (let i = 0; i < chars.length; i++) {
    const code = chars[i].charCodeAt(0);
    const pattern = [(code % 2 === 0), (code % 3 === 0), (code % 5 === 0), (code % 7 === 0), true, false];
    bars = bars.concat(pattern);
  }
  
  bars = bars.concat([true, true, false, true]); // stop guard

  const barWidth = width / bars.length;
  let rects = '';
  
  bars.forEach((isBlack, idx) => {
    if (isBlack) {
      rects += `<rect x="${(idx * barWidth).toFixed(1)}" y="0" width="${(barWidth * 0.9).toFixed(1)}" height="${height}" fill="#0f172a" />`;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto">${rects}</svg>`;
}

export function formatLocationCode(loc: { zone: string; aisle: string; rack: string; shelf: string; bin: string }): string {
  const zCode = loc.zone.substring(0, 3).toUpperCase();
  return `${zCode}-${loc.aisle}-${loc.rack}-${loc.shelf}-${loc.bin}`;
}
