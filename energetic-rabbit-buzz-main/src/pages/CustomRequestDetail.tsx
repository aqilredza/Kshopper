import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { showError } from '@/utils/toast';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

type CustomRequest = {
  id: string;
  created_at: string;
  product_description: string;
  status: string;
  category: string | null;
  image_url: string | null;
  product_link: string | null;
  notes: string | null;
};

const CustomRequestDetail = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [request, setRequest] = useState<CustomRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) {
        navigate('/account');
        return;
      }

      if (!session) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('custom_requests')
        .select('*')
        .eq('id', requestId)
        .eq('user_id', session.user.id)
        .single();

      if (error || !data) {
        showError('Could not find the specified request.');
        navigate('/account');
      } else {
        setRequest(data as unknown as CustomRequest);
      }
      setLoading(false);
    };

    fetchRequest();
  }, [requestId, navigate, session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Button variant="ghost" onClick={() => navigate('/account')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Account
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Request Details</CardTitle>
              <CardDescription>Submitted on {format(new Date(request.created_at), 'PPP')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-1">Product Description</h3>
                <p className="text-muted-foreground">{request.product_description}</p>
              </div>
              {request.notes && (
                <div>
                  <h3 className="font-semibold mb-1">Additional Notes</h3>
                  <p className="text-muted-foreground">{request.notes}</p>
                </div>
              )}
              {request.product_link && (
                <div>
                  <h3 className="font-semibold mb-1">Product Link</h3>
                  <a href={request.product_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                    {request.product_link} <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Status</span>
                <Badge variant={request.status === 'pending' ? 'secondary' : 'default'}>
                  {request.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Category</span>
                <span>{request.category || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
          {request.image_url && (
            <Card>
              <CardHeader>
                <CardTitle>Submitted Image</CardTitle>
              </CardHeader>
              <CardContent>
                <a href={request.image_url} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={request.image_url} 
                    alt="Custom request" 
                    className="rounded-md w-full h-auto object-cover" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                      target.onerror = null;
                    }}
                  />
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomRequestDetail;