import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Search, Menu, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import { Session } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

const ADMIN_EMAIL = "mredza31@gmail.com";

const Header = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [profile, setProfile] = useState<{ avatar_url: string; full_name: string } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]); // admin only
  const [pendingRequests, setPendingRequests] = useState<any[]>([]); // admin only
  const [userOrderUpdates, setUserOrderUpdates] = useState<any[]>([]); // user only
  const [userRequestUpdates, setUserRequestUpdates] = useState<any[]>([]); // user only
  const [dismissedOrderIds, setDismissedOrderIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('dismissedOrderIds') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  });
  // Store dismissed requests as { id, updated_at } objects
  const [dismissedRequestIds, setDismissedRequestIds] = useState<{id: string, updated_at: string}[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('dismissedRequestIds') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  });
  const [showNotif, setShowNotif] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  // Close notification dropdown when clicking outside
  useEffect(() => {
    if (!showNotif) return;
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotif]);
  const [notifSeen, setNotifSeen] = useState(false);
  const [userNotifSeen, setUserNotifSeen] = useState(false);
  // Fetch pending orders and custom requests for admin notification
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session) {
        setPendingOrders([]);
        setPendingRequests([]);
        setUserOrderUpdates([]);
        setUserRequestUpdates([]);
        return;
      }
      if (session.user.email === ADMIN_EMAIL) {
        // Admin: fetch pending orders/requests
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, created_at, user_id, total_price')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        setPendingOrders(ordersError || !orders ? [] : orders);

        const { data: requests, error: requestsError } = await supabase
          .from('custom_requests')
          .select('id, created_at, product_description')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        setPendingRequests(requestsError || !requests ? [] : requests);
        setNotifSeen(false);
      } else {
        // Normal user: fetch orders/requests with status changes (not just pending)
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, created_at, status, total_price, updated_at')
          .eq('user_id', session.user.id)
          .neq('status', 'deleted')
          .order('updated_at', { ascending: false });
        // Only show orders updated in the last 2 days and not pending
        const recentOrderUpdates = (ordersError || !orders) ? [] : orders.filter((o: any) => o.status !== 'pending' && o.updated_at && (new Date().getTime() - new Date(o.updated_at).getTime() < 2*24*60*60*1000));
        setUserOrderUpdates(recentOrderUpdates);
        // Remove dismissed orders that are no longer in updates
        setDismissedOrderIds(ids => {
          const filtered = ids.filter(id => recentOrderUpdates.some((o: any) => o.id === id));
          localStorage.setItem('dismissedOrderIds', JSON.stringify(filtered));
          return filtered;
        });

        const { data: requests, error: requestsError } = await supabase
          .from('custom_requests')
          .select('id, created_at, status, product_description, updated_at')
          .eq('user_id', session.user.id)
          .neq('status', 'deleted')
          .order('updated_at', { ascending: false });
        // Show any status change (except deleted) in the last 2 days
        let recentRequestUpdates = [];
        if (!requestsError && requests) {
          recentRequestUpdates = requests.filter((r: any) =>
            r.status && r.status !== 'deleted' &&
            r.updated_at && (new Date().getTime() - new Date(r.updated_at).getTime() < 2*24*60*60*1000)
          );
          // Debug log
          if (recentRequestUpdates.length === 0) {
            console.log('[Notification Debug] No custom request status changes found. All requests:', requests);
          } else {
            console.log('[Notification Debug] Custom request status changes:', recentRequestUpdates);
          }
        }
        setUserRequestUpdates(recentRequestUpdates);
        setDismissedRequestIds(ids => {
          // Only keep dismissed if updated_at matches
          const filtered = ids.filter(dismissed => recentRequestUpdates.some((r: any) => r.id === dismissed.id && r.updated_at === dismissed.updated_at));
          localStorage.setItem('dismissedRequestIds', JSON.stringify(filtered));
          return filtered;
        });
        setUserNotifSeen(false);
      }
    };
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
      setNotifSeen(false);
      setUserNotifSeen(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (session) {
      // Fetch user profile when session is available
      fetchUserProfile(session.user.id);
    } else {
      setProfile(null);
    }
  }, [session]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, full_name')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleCartClick = () => {
    if (session) {
      navigate('/cart');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    try {
      // Force sign out with a different approach
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      // Clear any local storage data
      localStorage.clear();
      
      // Navigate to home page first
      navigate('/');
      
      // Refresh the page to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Even if Supabase logout fails, clear local data and redirect
      try {
        localStorage.clear();
      } catch (storageError) {
        console.error('Error clearing local storage:', storageError);
      }
      
      // Navigate to home and refresh
      navigate('/');
      window.location.reload();
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('search') as string;
    if (query?.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      event.currentTarget.reset();
      setIsSearchOpen(false);
    }
  };

  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => {
    const commonClasses = "transition-all duration-300 relative transform";
    const mobileClasses = "text-xl";
    const desktopClasses = "text-lg font-bold";
    
    // Text color with hover effect and lift
    const textClasses = "text-foreground hover:text-red-500";

    const linkProps = {
      onClick: isMobile ? () => setIsMobileMenuOpen(false) : undefined,
    };

    return (
      <>
        <Link 
          to="/category/k-beauty" 
          className={`${commonClasses} ${isMobile ? mobileClasses : desktopClasses} ${textClasses}`} 
          {...linkProps}
          style={{
            textShadow: "0 10px 15px rgba(239, 68, 68, 0.3), 0 4px 6px rgba(236, 72, 153, 0.3)"
          }}
        >
          K-Beauty
        </Link>
        <Link 
          to="/category/k-fashion" 
          className={`${commonClasses} ${isMobile ? mobileClasses : desktopClasses} ${textClasses}`} 
          {...linkProps}
          style={{
            textShadow: "0 10px 15px rgba(239, 68, 68, 0.3), 0 4px 6px rgba(236, 72, 153, 0.3)"
          }}
        >
          K-Fashion
        </Link>
        <Link 
          to="/category/k-food" 
          className={`${commonClasses} ${isMobile ? mobileClasses : desktopClasses} ${textClasses}`} 
          {...linkProps}
          style={{
            textShadow: "0 10px 15px rgba(239, 68, 68, 0.3), 0 4px 6px rgba(236, 72, 153, 0.3)"
          }}
        >
          K-Food
        </Link>
        <Link 
          to="/custom-request" 
          className={`${commonClasses} ${isMobile ? mobileClasses : desktopClasses} ${textClasses}`} 
          {...linkProps}
          style={{
            textShadow: "0 10px 15px rgba(239, 68, 68, 0.3), 0 4px 6px rgba(236, 72, 153, 0.3)"
          }}
        >
          Request Items
        </Link>
      </>
    );
  };

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <div className="md:hidden mr-4">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-black uppercase">
                      <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="bg-gradient-to-r from-red-500 via-pink-500 to-blue-600 bg-clip-text text-transparent">KShopper</span>
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col space-y-6 mt-8">
                    <NavLinks isMobile />
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            <div className="text-3xl font-black uppercase">
              <Link to="/">
                <span className="bg-gradient-to-r from-red-500 via-pink-500 to-blue-600 bg-clip-text text-transparent">KShopper</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-lg font-bold ml-10">
              <NavLinks />
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            {/* Notification icon for both admin and normal users */}
            {session && (
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={() => {
                  setShowNotif((v) => !v);
                  if (isAdmin) setNotifSeen(true);
                  else setUserNotifSeen(true);
                }} className="relative">
                  <Bell className="h-6 w-6" />
                  {isAdmin && (!notifSeen && (pendingOrders.length + pendingRequests.length > 0)) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">
                      {pendingOrders.length + pendingRequests.length}
                    </span>
                  )}
                  {!isAdmin && (!userNotifSeen && ((userOrderUpdates.filter((o: any) => !dismissedOrderIds.includes(o.id)).length + userRequestUpdates.filter((r: any) => !dismissedRequestIds.some(d => d.id === r.id && d.updated_at === r.updated_at)).length) > 0)) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">
                      {userOrderUpdates.filter((o: any) => !dismissedOrderIds.includes(o.id)).length + userRequestUpdates.filter((r: any) => !dismissedRequestIds.some(d => d.id === r.id && d.updated_at === r.updated_at)).length}
                    </span>
                  )}
                </Button>
                {showNotif && (
                  <div ref={notifDropdownRef} className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
                    <div className="p-3 border-b font-bold">Notifications</div>
                    <div className="max-h-80 overflow-y-auto">
                      {isAdmin && (
                        <>
                          {pendingOrders.length > 0 && (
                            <div>
                              <div className="px-3 py-2 text-sm font-semibold text-primary">New Orders</div>
                              {pendingOrders.map((order: any) => (
                                <div key={order.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                                  onClick={() => {
                                    setShowNotif(false);
                                    setTimeout(() => navigate('/admin/manage-orders'), 100);
                                  }}>
                                  <div><span className="font-medium">Order ID:</span> {order.id}</div>
                                  <div><span className="font-medium">Date:</span> {order.created_at ? new Date(order.created_at).toLocaleString() : ''}</div>
                                  <div><span className="font-medium">Total:</span> MYR {order.total_price?.toFixed(2) ?? '-'}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {pendingRequests.length > 0 && (
                            <div>
                              <div className="px-3 py-2 text-sm font-semibold text-primary">New Custom Requests</div>
                              {pendingRequests.map((req: any) => (
                                <div key={req.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                                  onClick={() => {
                                    setShowNotif(false);
                                    setTimeout(() => navigate('/admin/custom-requests'), 100);
                                  }}>
                                  <div><span className="font-medium">Request ID:</span> {req.id}</div>
                                  <div><span className="font-medium">Date:</span> {req.created_at ? new Date(req.created_at).toLocaleString() : ''}</div>
                                  <div><span className="font-medium">Description:</span> {req.product_description?.slice(0, 40) ?? '-'}{req.product_description?.length > 40 ? '...' : ''}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {(pendingOrders.length === 0 && pendingRequests.length === 0) && (
                            <div className="px-3 py-4 text-center text-muted-foreground">No new notifications.</div>
                          )}
                        </>
                      )}
                      {!isAdmin && (
                        <>
                          {(() => {
                            // Combine and sort all user notifications by updated_at desc
                            const orderNotifs = userOrderUpdates.filter((o: any) => !dismissedOrderIds.includes(o.id)).map((order: any) => ({
                              type: 'order',
                              id: order.id,
                              status: order.status,
                              updated_at: order.updated_at,
                              description: '',
                            }));
                            const requestNotifs = userRequestUpdates.filter((r: any) => !dismissedRequestIds.some(d => d.id === r.id && d.updated_at === r.updated_at)).map((req: any) => ({
                              type: 'custom',
                              id: req.id,
                              status: req.status,
                              updated_at: req.updated_at,
                              description: req.product_description,
                            }));
                            const allNotifs = [...orderNotifs, ...requestNotifs].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
                            if (allNotifs.length === 0) {
                              return <div className="px-3 py-4 text-center text-muted-foreground">No new notifications.</div>;
                            }
                            return (
                              <div>
                                {allNotifs.map((notif) => notif.type === 'order' ? (
                                  <div key={notif.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                                    onMouseDown={() => {
                                      setShowNotif(false);
                                      setDismissedOrderIds(ids => {
                                        const updated = [...ids, notif.id];
                                        localStorage.setItem('dismissedOrderIds', JSON.stringify(updated));
                                        return updated;
                                      });
                                      setTimeout(() => navigate('/account?tab=orders'), 0);
                                    }}>
                                    <div><span className="font-medium">Order ID:</span> {notif.id}</div>
                                    <div><span className="font-medium">Status:</span> {notif.status}</div>
                                    <div><span className="font-medium">Updated:</span> {notif.updated_at ? new Date(notif.updated_at).toLocaleString() : ''}</div>
                                  </div>
                                ) : (
                                  <div key={notif.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                                    onMouseDown={() => {
                                      setShowNotif(false);
                                      setDismissedRequestIds(ids => {
                                        const updated = [...ids, { id: notif.id, updated_at: notif.updated_at }];
                                        localStorage.setItem('dismissedRequestIds', JSON.stringify(updated));
                                        return updated;
                                      });
                                      setTimeout(() => { navigate('/account?tab=requests'); }, 0);
                                    }}>
                                    <div><span className="font-medium">Request ID:</span> {notif.id}</div>
                                    <div><span className="font-medium">Status:</span> {notif.status}</div>
                                    <div><span className="font-medium">Updated:</span> {notif.updated_at ? new Date(notif.updated_at).toLocaleString() : ''}</div>
                                    <div><span className="font-medium">Description:</span> {notif.description?.slice(0, 40) ?? '-'}{notif.description?.length > 40 ? '...' : ''}</div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Search className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Search for Products</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <Input name="search" placeholder="What are you looking for?" className="flex-grow" autoFocus />
                  <Button type="submit">Search</Button>
                </form>
              </DialogContent>
            </Dialog>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || session.user.user_metadata?.avatar_url} alt="User avatar" />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    Account Overview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/custom-request')}>
                    Request Items
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/categories')}>
                        Manage Categories
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/hot-items')}>
                        Manage Hot Items
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/custom-requests')}>
                        Custom Requests
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/manage-orders')}>
                        Manage Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/products')}>
                        Manage Products
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={() => navigate('/login')}>
                    Login
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="ghost" size="icon" onClick={handleCartClick}>
              <ShoppingBag className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;