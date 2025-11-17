import { Check, ChevronsUpDown } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function ClientSwitcher() {
  const { state, currentClient, switchClient } = useApp();

  if (!currentClient) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="button-client-switcher">
          <Avatar className="h-6 w-6">
            <AvatarImage src={currentClient.logo} alt={currentClient.name} />
            <AvatarFallback>{currentClient.name[0]}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{currentClient.name}</span>
          <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {state.clients.map((client) => (
          <DropdownMenuItem
            key={client.id}
            onClick={() => switchClient(client.id)}
            data-testid={`client-option-${client.id}`}
            className="gap-2"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={client.logo} alt={client.name} />
              <AvatarFallback>{client.name[0]}</AvatarFallback>
            </Avatar>
            <span>{client.name}</span>
            {currentClient.id === client.id && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
