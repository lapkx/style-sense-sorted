import { Header } from '@/components/layout/Header';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Welcome to Your Virtual Closet</h1>
          <p className="text-lg text-muted-foreground">
            Start building your digital wardrobe by uploading photos of your clothes
          </p>
          <div className="mt-8 p-8 border-2 border-dashed border-muted rounded-lg">
            <p className="text-muted-foreground">
              Clothing upload and management features coming next...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;