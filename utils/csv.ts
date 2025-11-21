import { InventoryItem, ProcessingStatus } from '../types';

export const parseCSV = (content: string): InventoryItem[] => {
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  const items: InventoryItem[] = [];
  
  // Simple heuristic: find the first column that looks like a URL
  // If headers exist, we skip the first row if it doesn't look like a URL
  
  let startIndex = 0;
  if (lines.length > 0) {
    const firstLineCols = lines[0].split(',');
    const hasUrl = firstLineCols.some(col => col.trim().startsWith('http'));
    if (!hasUrl) {
        startIndex = 1; // Assume header
    }
  }

  for (let i = startIndex; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    // Find URL
    const url = cols.find(c => c.startsWith('http') || c.startsWith('www'));
    
    if (url) {
      items.push({
        id: crypto.randomUUID(),
        imageUrl: url,
        status: ProcessingStatus.PENDING,
        detections: []
      });
    }
  }

  return items;
};
