
import { useState } from 'react';
import { Bell, ChevronDown, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from './Logo';

interface HeaderProps {
  userName: string;
  parentOptions: string[];
  unreviewedCount: number;
  onParentChange: (parent: string) => void;
}

export function Header({ userName, parentOptions, unreviewedCount, onParentChange }: HeaderProps) {
  const [selectedParent, setSelectedParent] = useState(parentOptions[0] || "All Parents");

  const handleParentChange = (parent: string) => {
    setSelectedParent(parent);
    onParentChange(parent);
  };

  return (
    <header className="bg-white border-b border-scamguard-border sticky top-0 z-10 py-4 px-6 lg:px-8">
      <div className="flex items-center justify-between max-w-[1920px] mx-auto">
        <div className="flex items-center">
          <div className="flex items-center mr-8">
            <Logo size="md" className="mr-3" />
            <h1 className="text-xl font-semibold tracking-tight hidden sm:block">
              ScamGuard
            </h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 text-left h-9 min-w-[180px]">
                <span className="truncate">{selectedParent}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[180px]">
              {parentOptions.map((parent) => (
                <DropdownMenuItem 
                  key={parent}
                  onClick={() => handleParentChange(parent)}
                  className="cursor-pointer"
                >
                  {parent}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
              <Bell className="h-5 w-5" />
            </Button>
            {unreviewedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-scamguard-high text-white text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1 animate-fade-in">
                {unreviewedCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium hidden sm:block">Welcome, {userName}</span>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
