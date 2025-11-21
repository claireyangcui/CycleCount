import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import InventoryList from './components/InventoryList';
import UploadArea from './components/UploadArea';
import Analytics from './components/Analytics';
import { InventoryItem, ProcessingStatus } from './types';
import { analyzeImage } from './services/gemini';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const handleUpload = (newItems: InventoryItem[]) => {
    setInventory(prev => [...prev, ...newItems]);
    setActiveTab('dashboard');
  };

  const processQueue = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    // Process only pending items
    const pendingItems = inventory.filter(item => item.status === ProcessingStatus.PENDING);
    
    // We process sequentially to be nice to rate limits, but could use promise.all with limits for speed
    // Using a for loop for simplicity and sequential updates
    
    let currentDone = 0;
    const totalToProcess = pendingItems.length;

    // Reset counts for this run if needed, but we track global progress usually
    // Let's iterate through the main inventory array index to update state correctly
    
    const newInventory = [...inventory];
    
    for (let i = 0; i < newInventory.length; i++) {
        if (newInventory[i].status === ProcessingStatus.PENDING) {
            // Update status to processing
            newInventory[i].status = ProcessingStatus.PROCESSING;
            setInventory([...newInventory]); // Trigger UI update

            try {
                const detections = await analyzeImage(newInventory[i].imageUrl);
                newInventory[i].detections = detections;
                newInventory[i].status = ProcessingStatus.COMPLETED;
            } catch (err: any) {
                newInventory[i].status = ProcessingStatus.ERROR;
                newInventory[i].error = err.message || "Unknown error";
            }
            
            // Update UI after each item
            setInventory([...newInventory]);
            currentDone++;
            setProcessedCount(prev => prev + 1);
        }
    }

    setIsProcessing(false);
  };

  // Calculate global progress
  const totalItems = inventory.length;
  const progress = totalItems > 0 ? (inventory.filter(i => i.status === ProcessingStatus.COMPLETED || i.status === ProcessingStatus.ERROR).length / totalItems) * 100 : 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-textMain font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 h-full flex flex-col relative">
        {activeTab === 'upload' && <UploadArea onUpload={handleUpload} />}
        
        {activeTab === 'dashboard' && (
            <InventoryList 
                items={inventory} 
                onProcess={processQueue} 
                isProcessing={isProcessing}
                progress={progress}
            />
        )}

        {activeTab === 'analytics' && <Analytics items={inventory} />}
      </main>
    </div>
  );
};

export default App;
