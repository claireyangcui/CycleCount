import React, { useCallback } from 'react';
import { UploadCloud, FileText, MousePointerClick } from 'lucide-react';
import { parseCSV } from '../utils/csv';
import { InventoryItem } from '../types';

interface UploadAreaProps {
  onUpload: (items: InventoryItem[]) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onUpload }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const items = parseCSV(text);
        onUpload(items);
      };
      reader.readAsText(file);
    }
  }, [onUpload]);

  return (
    <div className="max-w-2xl mx-auto mt-32 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-textMain mb-3">Import Inventory</h2>
            <p className="text-textMuted text-sm max-w-md mx-auto">
                Upload a CSV file containing image URLs. The AI will analyze each image to build your inventory database.
            </p>
        </div>

      <label className="flex flex-col items-center justify-center w-full h-64 border border-dashed border-border rounded-xl cursor-pointer bg-surface/30 hover:bg-surface/60 hover:border-primary/30 transition-all duration-300 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5 group-hover:scale-105 group-hover:shadow-lg transition-all duration-300 shadow-sm">
             <UploadCloud className="w-6 h-6 text-textMuted group-hover:text-primary transition-colors" />
          </div>
          <p className="mb-2 text-sm text-textMain font-medium">Drop CSV file here</p>
          <div className="flex items-center gap-2 text-xs text-textMuted">
            <MousePointerClick size={12} />
            <span>or click to browse</span>
          </div>
        </div>
        <input 
            type="file" 
            className="hidden" 
            accept=".csv"
            onChange={handleFileChange}
        />
      </label>

      <div className="mt-10 grid grid-cols-2 gap-4">
        <div className="bg-surface/30 rounded-lg p-4 border border-border/50">
             <h4 className="text-xs font-medium text-textMain mb-2 flex items-center gap-2">
                <FileText size={14} className="text-primary" />
                CSV Structure
             </h4>
             <div className="bg-[#000] rounded p-2 font-mono text-[10px] text-textMuted leading-relaxed border border-white/5">
                id,image_url,location<br/>
                1,https://site.com/bike1.jpg,Lot A<br/>
                2,https://site.com/bike2.jpg,Lot B
             </div>
        </div>
        
        <div className="bg-surface/30 rounded-lg p-4 border border-border/50">
             <h4 className="text-xs font-medium text-textMain mb-2">AI Capabilities</h4>
             <ul className="space-y-1.5">
                {['Frame Color Detection', 'Fender Color Detection', 'Main vs Background'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-textMuted">
                        <div className="w-1 h-1 rounded-full bg-primary/50" />
                        {item}
                    </li>
                ))}
             </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;