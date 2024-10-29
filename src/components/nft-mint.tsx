"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import type { ThirdwebContract } from "thirdweb";
import { MediaRenderer, NFT } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import React from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ref, push, set, get, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '@/lib/firebase';

type Props = {
  contract: ThirdwebContract;
  displayName: string;
  description: string;
  contractImage: string;
  pricePerToken: number | null;
  currencySymbol: string | null;
  isERC1155: boolean;
  isERC721: boolean;
  tokenId: bigint;
};

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
}

export function NftMint(props: Props) {
  // Stati base
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { theme } = useTheme();
  const [nextTokenId, setNextTokenId] = useState<String>('');

  // Stati per il form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: ''
  });

  // Indirizzo del wallet amministratore
  const adminWalletAddress = "0xF186C4256883d4e1368e37D67400fCE717FDf095";

  const fetchNextTokenId = async () => {
    try {
      const requestsRef = ref(database, 'mint-requests');
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        let maxTokenId = -1;  // Iniziamo da -1
        
        // Iteriamo su tutti i record per trovare il massimo tokenId
        snapshot.forEach((childSnapshot) => {
          const request = childSnapshot.val();
          const currentTokenId = parseInt(request.tokenId);
          if (!isNaN(currentTokenId) && currentTokenId > maxTokenId) {
            maxTokenId = currentTokenId;
          }
        });
        
        // Il prossimo tokenId sarà il massimo trovato + 1
        const nextToken = (maxTokenId + 1).toString();
        console.log('Massimo TokenId trovato:', maxTokenId);
        console.log('Prossimo TokenId:', nextToken);
        setNextTokenId(nextToken);
      } else {
        // Se non ci sono richieste precedenti, inizia da 0
        console.log('Nessuna richiesta trovata, iniziamo da 0');
        setNextTokenId('0');
      }
    } catch (error) {
      console.error("Errore nel recupero del prossimo tokenId:", error);
      setNextTokenId('0');
    }
  };
  
  // Chiama fetchNextTokenId quando si apre il form
  const handleBuyClick = () => {
    setShowForm(true);
    fetchNextTokenId();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Salva la richiesta nel database
      await fetchNextTokenId();
      
      const mintRequest = {
        ...formData,
        quantity,
        contractAddress: props.contract.address,
        contractType: props.isERC1155 ? 'ERC1155' : props.isERC721 ? 'ERC721' : 'ERC20',
        tokenId: nextTokenId,
        timestamp: new Date().toISOString(),
        status: 'pending',
        destinationAddress: adminWalletAddress
      };

      const requestsRef = ref(database, 'mint-requests');
      await push(requestsRef, mintRequest);

      toast.success("Richiesta inviata con successo!");
      setShowForm(false);
      setIsProcessing(false);
    } catch (error) {
      console.error("Errore nell'invio della richiesta:", error);
      toast.error("Si è verificato un errore. Riprova più tardi.");
      setIsProcessing(false);
    }
  };

  if (props.pricePerToken === null || props.pricePerToken === undefined) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {/* NFT Image */}
          <div className="aspect-square overflow-hidden rounded-lg mb-4 relative">
            {props.isERC1155 ? (
              <NFT contract={props.contract} tokenId={props.tokenId}>
                <React.Suspense fallback={<Skeleton className="w-full h-full object-cover" />}>
                  <NFT.Media className="w-full h-full object-cover" />
                </React.Suspense>
              </NFT>
            ) : (
              <MediaRenderer
                client={client}
                className="w-full h-full object-cover"
                alt=""
                src={props.contractImage || "/placeholder.svg?height=400&width=400"}
              />
            )}
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm font-semibold">
              {props.pricePerToken} {props.currencySymbol}/each
            </div>
          </div>

          {/* NFT Details */}
          <h2 className="text-2xl font-bold mb-2 dark:text-white">
            {props.displayName}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {props.description}
          </p>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
            </div>
            <div className="text-base pr-1 font-semibold dark:text-white">
              Total: Free
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            onClick={handleBuyClick}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : `Buy ${quantity} NFT${quantity > 1 ? "s" : ""}`}
          </Button>
        </CardFooter>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your details to complete the purchase</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label> Your IOC Verify ID: </Label>
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-mono">
                IOC-KYCVerify-{nextTokenId || 'Loading...'}
              </div>
              <Label htmlFor="firstName">First Name</Label>
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
              <Label htmlFor="lastName">Last Name</Label>
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
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                Confirm Purchase
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}