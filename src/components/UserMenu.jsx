import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, MapPin, Mail, Phone, Edit, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UserMenu = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
    window.location.reload();
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground w-10 h-10 flex items-center justify-center font-body font-medium text-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-[#1a1a1a]"
          aria-label="User menu"
        >
          {getInitials(user.name)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-border dark:border-white/20 bg-background dark:bg-[#2a2538] text-foreground dark:text-white shadow-xl z-50">
        <DropdownMenuLabel className="font-body">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-[#2f2540] dark:text-white">{user.name}</p>
            <p className="text-xs font-normal text-[#8b8794] dark:text-white/70">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[rgba(47,37,64,0.08)] dark:bg-white/20" />
        <DropdownMenuItem
          className="cursor-pointer font-body text-sm text-[#2f2540] dark:text-white focus:bg-[#f6f1f8] dark:focus:bg-white/10"
          onClick={() => {
            setOpen(false);
            navigate("/account");
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          Manage Account
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer font-body text-sm text-[#2f2540] dark:text-white focus:bg-[#f6f1f8] dark:focus:bg-white/10"
          onClick={() => {
            setOpen(false);
            navigate("/cart");
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          My Cart
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[rgba(47,37,64,0.08)] dark:bg-white/20" />
        <DropdownMenuItem
          className="cursor-pointer font-body text-sm text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/20"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;

