export enum ProcessingStatus {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface BikeDetection {
  frameColor: string;
  fenderColor: string;
  type: 'Main' | 'Background';
  category: 'Road' | 'Mountain' | 'City' | 'Other';
}

export interface InventoryItem {
  id: string;
  imageUrl: string;
  status: ProcessingStatus;
  detections: BikeDetection[];
  error?: string;
  fileName?: string; // Optional source filename from CSV row
}

export interface InventoryStats {
  totalBikes: number;
  processedImages: number;
  colorBreakdown: Record<string, number>; // e.g., "Blue Frame / Black Fender": 5
  typeBreakdown: Record<string, number>;
}
