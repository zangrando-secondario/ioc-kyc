// components/UserFormDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ref, push, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { toast } from "sonner";

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  walletAddress: string;
  quantity: number;
  contractAddress: string;
}

export function UserFormDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  walletAddress,
  quantity,
  contractAddress
}: UserFormDialogProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Crea un oggetto con i dati da salvare
      const userData = {
        ...formData,
        walletAddress,
        quantity,
        contractAddress,
        timestamp: new Date().toISOString(),
        status: 'pending' // Utile per tracciare lo stato del mint
      };

      // Crea un riferimento per i dati del mint nel database
      const mintsRef = ref(database, 'nft-mints');
      const newMintRef = push(mintsRef); // Genera un nuovo ID univoco
      
      // Salva i dati
      await set(newMintRef, userData);

      // Chiudi il dialog e procedi con il mint
      onClose();
      onSubmit();
      toast.success("Dati salvati correttamente");
    } catch (error) {
      console.error("Errore nel salvare i dati:", error);
      toast.error("Errore nel salvare i dati");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inserisci i tuoi dati per procedere con il mint</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="firstName">Nome</Label>
            <Input
              required
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                firstName: e.target.value
              }))}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="lastName">Cognome</Label>
            <Input
              required
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                lastName: e.target.value
              }))}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              required
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                email: e.target.value
              }))}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvataggio..." : "Conferma"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}