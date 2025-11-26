import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, MapPin, Mail, Phone, Edit } from "lucide-react";
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
          className="rounded-full border border-white/40 p-2.5 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="User menu"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
            {getInitials(user.name)}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-white/20 bg-[#5c3d8a] text-white shadow-xl">
        <DropdownMenuLabel className="font-display">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{user.name}</p>
            <p className="text-xs font-normal text-white/70">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/20" />
        <DropdownMenuItem
          className="cursor-pointer font-display text-sm focus:bg-white/10 focus:text-white"
          onClick={() => {
            setOpen(false);
            navigate("/account");
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          Manage Account
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer font-display text-sm focus:bg-white/10 focus:text-white"
          onClick={() => {
            setOpen(false);
            navigate("/account?tab=addresses");
          }}
        >
          <MapPin className="mr-2 h-4 w-4" />
          My Addresses
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/20" />
        <DropdownMenuItem
          className="cursor-pointer font-display text-sm text-red-300 focus:bg-red-500/20 focus:text-red-300"
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

