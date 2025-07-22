import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ClothingUpload } from '@/components/clothing/ClothingUpload';
import { ClothingGrid } from '@/components/clothing/ClothingGrid';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('closet');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Your Virtual Closet</h1>
            <Button 
              onClick={() => setActiveTab('upload')}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="closet">My Closet</TabsTrigger>
              <TabsTrigger value="upload">Add Item</TabsTrigger>
            </TabsList>
            
            <TabsContent value="closet" className="space-y-4">
              <ClothingGrid 
                refreshTrigger={refreshTrigger}
              />
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <ClothingUpload 
                onUploadComplete={() => {
                  setActiveTab('closet');
                  setRefreshTrigger(prev => prev + 1);
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;