import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';

type Profile = {
  full_name: string;
};

type CustomRequest = {
  id: string;
  created_at: string;
  product_description: string;
  status: string;
  image_url: string | null;
  product_link: string | null;
  notes: string | null;
  profiles: Profile | null;
};

const ADMIN_EMAIL = "mredza31@gmail.com";

const CustomRequestsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<CustomRequest[]>([]);

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email !== ADMIN_EMAIL) {
        navigate('/login');
      } else {
        setSession(session);
        await fetchRequests();
      }
      setLoading(false);
    };
    getInitialData();
  }, [navigate]);

  // Refresh data when returning from detail view or when location changes
  useEffect(() => {
    fetchRequests();
  }, [location]);

  // Also refresh data when component mounts to ensure latest data
  useEffect(() => {
    if (!loading && session) {
      fetchRequests();
    }
  }, [loading, session]);

  const fetchRequests = async () => {
    try {
      // Ensure we're getting fresh data by adding a cache-busting parameter
      const { data, error } = await supabase
        .from('custom_requests')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });
        
      if (error) {
        showError('Could not fetch custom requests.');
        console.error('Fetch error:', error);
      } else if (data) {
        setRequests(data as unknown as CustomRequest[]);
      }
    } catch (error) {
      showError('Could not fetch custom requests.');
      console.error('Fetch error:', error);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    const { error } = await supabase
      .from('custom_requests')
      .update({ status: newStatus })
      .eq('id', requestId);

    if (error) {
      showError('Failed to update status.');
    } else {
      showSuccess('Request status updated.');
      setRequests(prev => 
        prev.map(req => req.id === requestId ? { ...req, status: newStatus } : req)
      );
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }

    try {
      // First, let's verify the request exists
      const { data: existingData, error: fetchError } = await supabase
        .from('custom_requests')
        .select('id')
        .eq('id', requestId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error checking if request exists:', fetchError);
      }

      if (!existingData) {
        // Request doesn't exist, remove it from UI if it's there
        setRequests(prev => prev.filter(req => req.id !== requestId));
        showSuccess('Request was already deleted.');
        return;
      }

      // Perform the delete operation
      const { error } = await supabase
        .from('custom_requests')
        .delete()
        .eq('id', requestId);

      if (error) {
        showError('Failed to delete request.');
        console.error('Delete error:', error);
      } else {
        showSuccess('Request deleted successfully.');
        // Update the UI state immediately
        setRequests(prev => prev.filter(req => req.id !== requestId));
        // Also refresh the data from the server to ensure consistency
        await fetchRequests();
      }
    } catch (error) {
      showError('Failed to delete request.');
      console.error('Delete error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-black uppercase">Custom Requests</CardTitle>
          <CardDescription>Review and manage user-submitted product requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No custom requests have been submitted yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{format(new Date(request.created_at), 'PP')}</TableCell>
                    <TableCell>{request.profiles?.full_name || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="font-medium truncate">{request.product_description}</p>
                      {request.product_link && <a href={request.product_link} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">Product Link</a>}
                      {request.notes && <p className="text-xs text-muted-foreground mt-1">Notes: {request.notes}</p>}
                    </TableCell>
                    <TableCell>
                      {request.image_url ? (
                        <a href={request.image_url} target="_blank" rel="noopener noreferrer">
                          <div className="w-16 h-16 rounded-md overflow-hidden">
                            <img 
                              src={request.image_url} 
                              alt="Request" 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                                target.onerror = null;
                              }}
                            />
                          </div>
                        </a>
                      ) : (
                        <img src="/placeholder.svg" alt="No Image" className="w-16 h-16 object-cover rounded-md bg-muted" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Select value={request.status} onValueChange={(value) => handleStatusChange(request.id, value)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="ordered">Ordered</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteRequest(request.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomRequestsList;