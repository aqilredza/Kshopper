import AddProductForm from '@/components/admin/AddProductForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ADMIN_EMAIL = "mredza31@gmail.com";

const AddProductPage = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email === ADMIN_EMAIL) {
                setIsAdmin(true);
            } else {
                navigate('/');
            }
            setLoading(false);
        };
        checkAdmin();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-3xl font-black uppercase text-center">Add New Product</CardTitle>
                </CardHeader>
                <CardContent>
                    <AddProductForm />
                </CardContent>
            </Card>
        </div>
    );
};

export default AddProductPage;