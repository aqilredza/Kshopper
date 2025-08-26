import { Button } from "@/components/ui/button";
import { ShoppingBag, User, Search, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
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

const ADMIN_EMAIL = "mredza31@gmail.com";

const Header = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCartClick = () => {
    if (session) {
      navigate('/cart');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
    const commonClasses = "hover:text-primary transition-colors";
    const mobileClasses = "text-xl";
    const desktopClasses = "text-lg font-bold";

    const linkProps = {
      onClick: isMobile ? () => setIsMobileMenuOpen(false) : undefined,
    };

    return (
      <>
        <Link to="/category/k-beauty" className={`${commonClasses} ${isMobile ? mobileClasses : desktopClasses}`} {...linkProps}>K-Beauty</Link>
        <Link to="/category/k-fashion" className={`${commonClasses} ${isMobile ? mobileClasses : desktopClasses}`} {...linkProps}>K-Fashion</Link>
        <Link to="/category/k-food" className={`${commonClasses} ${isMobile ? mobileClasses : desktopClasses}`} {...linkProps}>K-Food</Link>
        <Link to="/custom-request" className={`${commonClasses} ${isMobile ? mobileClasses : desktopClasses}`} {...linkProps}>Request Items</Link>
      </>
    );
  };

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
                      <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>KShopper</Link>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col space-y-6 mt-8">
                    <NavLinks isMobile />
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            <div className="text-3xl font-black uppercase">
              <Link to="/">KShopper</Link>
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-lg font-bold ml-10">
              <NavLinks />
            </nav>
          </div>

          <div className="flex items-center space-x-2">
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
                      <AvatarImage src={session.user.user_metadata?.avatar_url} alt="User avatar" />
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
                  {session.user.email === ADMIN_EMAIL && (
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