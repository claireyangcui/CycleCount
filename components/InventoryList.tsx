import React from 'react';
import { InventoryItem, ProcessingStatus } from '../types';
import { AlertCircle, Loader2, Play, Image as ImageIcon, Zap } from 'lucide-react';

interface InventoryListProps {
  items: InventoryItem[];
  onProcess: () => void;
  isProcessing: boolean;
  progress: number;
}

// Linear-style status icons
const StatusIcon: React.FC<{ status: ProcessingStatus }> = ({ status }) => {
  switch (status) {
    case ProcessingStatus.COMPLETED: 
        // Done: Checkmark in circle
        return (
            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_6px_rgba(94,106,210,0.4)]">
                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
        );
    case ProcessingStatus.PROCESSING: 
        // In Progress: Half circle
        return (
            <div className="relative w-4 h-4">
                <Loader2 className="w-4 h-4 text-warning animate-spin" />
            </div>
        );
    case ProcessingStatus.ERROR: 
        // Error
        return <AlertCircle className="text-danger" size={16} />;
    default: 
        // Todo: Empty circle
        return <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-textMuted" />;
  }
};

const InventoryList: React.FC<InventoryListProps> = ({ items, onProcess, isProcessing, progress }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-textMuted bg-background">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4 shadow-lg">
            <ImageIcon size={24} className="text-textMuted opacity-50" />
        </div>
        <p className="text-sm font-medium text-textMain">No inventory loaded</p>
        <p className="text-xs text-textMuted mt-1">Import a CSV file to get started.</p>
      </div>
    );
  }

  const completedCount = items.filter(i => i.status === ProcessingStatus.COMPLETED).length;
  const pendingCount = items.length - completedCount;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between h-14 px-6 border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-textMain">Inventory List</h2>
            <div className="h-4 w-[1px] bg-border mx-1"></div>
            <span className="text-xs text-textMuted">{items.length} items</span>
        </div>
        
        <div className="flex items-center gap-4">
             {isProcessing && (
                <div className="flex items-center gap-3 text-xs text-textMuted font-mono">
                    <span>{Math.round(progress)}%</span>
                    <div className="w-20 h-1 bg-surface rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-300 ease-out" 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>
                </div>
            )}

            <button
                onClick={onProcess}
                disabled={isProcessing || completedCount === items.length}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-all shadow-sm ${
                    isProcessing || completedCount === items.length
                    ? 'bg-surface border-border text-textMuted cursor-not-allowed opacity-50'
                    : 'bg-[#F7F8F8] border-transparent text-black hover:bg-white hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                }`}
            >
                {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} fill="currentColor" />}
                {isProcessing ? 'Processing' : 'Analyze'}
            </button>
        </div>
      </div>

      {/* List Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-2 text-xs font-medium text-textMuted border-b border-border select-none">
        <div className="col-span-1 flex items-center pl-1">ID</div>
        <div className="col-span-4">Source</div>
        <div className="col-span-7">Detected Specifications</div>
      </div>

      {/* Virtualized-ish List */}
      <div className="flex-1 overflow-y-auto">
        {items.map((item, idx) => {
            const identifier = `INV-${1000 + idx}`;
            return (
                <div 
                    key={item.id} 
                    className="grid grid-cols-12 gap-4 px-6 py-2.5 border-b border-border/50 hover:bg-surfaceHover transition-colors group items-center text-sm cursor-default"
                >
                    <div className="col-span-1 flex items-center gap-3 text-xs font-mono text-textMuted">
                        <StatusIcon status={item.status} />
                        <span className="opacity-70">{identifier}</span>
                    </div>
                    
                    <div className="col-span-4 flex items-center gap-3 overflow-hidden">
                        <div className="w-6 h-6 rounded bg-surface border border-border overflow-hidden shrink-0 group-hover:border-textMuted transition-colors relative">
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <a 
                            href={item.imageUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="truncate text-textMuted group-hover:text-primary transition-colors text-xs hover:underline decoration-primary/30"
                        >
                            {item.imageUrl}
                        </a>
                    </div>

                    <div className="col-span-7">
                        {item.status === ProcessingStatus.ERROR ? (
                            <span className="text-danger text-xs flex items-center gap-1">
                                <AlertCircle size={12} />
                                {item.error}
                            </span>
                        ) : item.detections.length > 0 ? (
                            <div className="flex flex-wrap gap-2 items-center">
                                {item.detections.map((d, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[11px] border border-border bg-surface text-textMuted/90 shadow-sm">
                                        <span 
                                            className="w-1.5 h-1.5 rounded-full border border-white/10 shadow-sm" 
                                            style={{ backgroundColor: d.frameColor.toLowerCase() === 'unknown' ? '#555' : d.frameColor.toLowerCase() }} 
                                        />
                                        <span className="font-medium text-textMain">{d.frameColor}</span>
                                        <span className="text-textMuted opacity-50">/</span>
                                        <span className="">{d.fenderColor === 'Unknown' ? 'No Fender' : d.fenderColor}</span>
                                        {d.type === 'Main' && <span className="ml-1 text-[9px] px-1 bg-primary/10 text-primary rounded uppercase tracking-tight">Main</span>}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-textMuted/30 text-xs font-normal">
                                {item.status === ProcessingStatus.COMPLETED ? 'No bikes detected' : 'Waiting for analysis...'}
                            </span>
                        )}
                    </div>
                </div>
            );
        })}
        
        {/* Empty spacer at bottom */}
        <div className="h-10"></div>
      </div>
    </div>
  );
};

export default InventoryList;