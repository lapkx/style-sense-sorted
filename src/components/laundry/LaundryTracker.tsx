import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarIcon, Droplets, Clock, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClothingItem {
  id: string;
  name: string;
  image_url: string;
  last_washed?: string;
  needs_washing: boolean;
  wash_frequency_days: number;
  care_instructions?: string;
}

interface LaundrySession {
  id: string;
  scheduled_date: string;
  clothing_item_ids: string[];
  status: 'planned' | 'in_progress' | 'completed';
  notes?: string;
}

export const LaundryTracker = () => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [laundrySession, setLaundrySession] = useState<LaundrySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [sessionNotes, setSessionNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch clothing items that need washing
      const { data: itemsData, error: itemsError } = await supabase
        .from('clothing_items')
        .select('id, name, image_url, last_washed, needs_washing, wash_frequency_days, care_instructions')
        .eq('user_id', user?.id)
        .eq('needs_washing', true);

      if (itemsError) throw itemsError;

      // Fetch laundry sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('laundry_schedule')
        .select('*')
        .eq('user_id', user?.id)
        .order('scheduled_date', { ascending: true });

      if (sessionsError) throw sessionsError;

      setItems(itemsData || []);
      setLaundrySession(sessionsData as LaundrySession[] || []);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsWashed = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('clothing_items')
        .update({ 
          last_washed: new Date().toISOString().split('T')[0],
          needs_washing: false 
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Item marked as clean",
        description: "The item has been updated.",
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error updating item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createLaundrySession = async () => {
    if (!selectedDate || selectedItems.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select a date and at least one item.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('laundry_schedule')
        .insert({
          user_id: user?.id,
          scheduled_date: selectedDate.toISOString().split('T')[0],
          clothing_item_ids: selectedItems,
          notes: sessionNotes,
          status: 'planned'
        });

      if (error) throw error;

      toast({
        title: "Laundry session scheduled",
        description: "Your laundry has been scheduled successfully.",
      });

      setShowCreateSession(false);
      setSelectedDate(undefined);
      setSessionNotes('');
      setSelectedItems([]);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error creating session",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateSessionStatus = async (sessionId: string, status: 'planned' | 'in_progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from('laundry_schedule')
        .update({ status })
        .eq('id', sessionId);

      if (error) throw error;

      if (status === 'completed') {
        // Mark all items in the session as washed
        const session = laundrySession.find(s => s.id === sessionId);
        if (session) {
          const { error: updateError } = await supabase
            .from('clothing_items')
            .update({ 
              last_washed: new Date().toISOString().split('T')[0],
              needs_washing: false 
            })
            .in('id', session.clothing_item_ids);

          if (updateError) throw updateError;
        }
      }

      toast({
        title: "Session updated",
        description: `Laundry session marked as ${status}.`,
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error updating session",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Laundry & Care Tracker</h2>
        <Dialog open={showCreateSession} onOpenChange={setShowCreateSession}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Laundry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Laundry Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Items to wash</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-2 border rounded cursor-pointer",
                        selectedItems.includes(item.id) ? "border-primary bg-primary/10" : "border-border"
                      )}
                      onClick={() => {
                        setSelectedItems(prev =>
                          prev.includes(item.id)
                            ? prev.filter(id => id !== item.id)
                            : [...prev, item.id]
                        );
                      }}
                    >
                      <p className="text-sm font-medium">{item.name}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Any special instructions..."
                />
              </div>
              <Button onClick={createLaundrySession} className="w-full">
                Schedule Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items that need washing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Droplets className="h-5 w-5 mr-2" />
            Items Needing Wash ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Great! No items need washing right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span className="text-xs text-muted-foreground">
                          Wash every {item.wash_frequency_days} days
                        </span>
                      </div>
                      {item.care_instructions && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.care_instructions}
                        </p>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => markAsWashed(item.id)}
                      >
                        Mark as Clean
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled laundry sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Scheduled Sessions ({laundrySession.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {laundrySession.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No laundry sessions scheduled.
            </p>
          ) : (
            <div className="space-y-4">
              {laundrySession.map((session) => (
                <Card key={session.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        {format(new Date(session.scheduled_date), "PPP")}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {session.clothing_item_ids.length} items to wash
                      </p>
                      {session.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {session.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        session.status === 'completed' ? 'default' :
                        session.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {session.status}
                      </Badge>
                      {session.status === 'planned' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSessionStatus(session.id, 'in_progress')}
                        >
                          Start
                        </Button>
                      )}
                      {session.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateSessionStatus(session.id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};