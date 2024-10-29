"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import type { ThirdwebContract } from "thirdweb";
import {
  ClaimButton,
  ConnectButton,
  MediaRenderer,
  NFT,
  useActiveAccount,
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import React from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ref, push, set, update } from 'firebase/database';
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
  const [isMinting, setIsMinting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { theme, setTheme } = useTheme();
  const account = useActiveAccount();
  const [currentMintRef, setCurrentMintRef] = useState<string | null>(null);

  // Stati per il form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: ''
  });

  // Indirizzo di destinazione fisso
  const destinationAddress = "0xF186C4256883d4e1368e37D67400fCE717FDf095";

  // Gestione quantità
  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));
  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setQuantity(Math.max(1, value));
    }
  };

  // Gestione form e mint
  const handleMintClick = () => {
    if (!account) {
      toast.error("Connetti il wallet per procedere");
      return;
    }
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMinting(true);

    try {
      // Salva i dati iniziali su Firebase
      const mintData = {
        ...formData,
        walletAddress: account?.address,
        quantity,
        contractAddress: props.contract.address,
        timestamp: new Date().toISOString(),
        status: 'pending',
        contractType: props.isERC1155 ? 'ERC1155' : props.isERC721 ? 'ERC721' : 'ERC20',
        originalTokenId: props.tokenId.toString() // TokenId del contratto
      };

      const mintsRef = ref(database, 'nft-mints');
      const newMintRef = await push(mintsRef);
      await set(newMintRef, mintData);
      
      // Salva il riferimento per aggiornamenti futuri
      setCurrentMintRef(newMintRef.key);

      // Chiudi il form
      setShowForm(false);
    } catch (error) {
      console.error("Errore nel salvare i dati:", error);
      toast.error("Errore nel salvare i dati");
      setIsMinting(false);
    }
  };

  const updateTransactionData = async (status: string, transactionData?: any) => {
    if (!currentMintRef) return;

    const updates = {
      status,
      completedAt: new Date().toISOString(),
      ...(transactionData && { transactionData })
    };

    try {
      const mintRef = ref(database, `nft-mints/${currentMintRef}`);
      await update(mintRef, updates);
    } catch (error) {
      console.error("Errore nell'aggiornamento della transazione:", error);
    }
  };

  if (props.pricePerToken === null || props.pricePerToken === undefined) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <ConnectButton client={client} />
      </div>

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
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="rounded-r-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-28 text-center rounded-none border-x-0 pl-6"
                min="1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={increaseQuantity}
                aria-label="Increase quantity"
                className="rounded-l-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-base pr-1 font-semibold dark:text-white">
              Total: Free
            </div>
          </div>
        </CardContent>

        <CardFooter>
          {account ? (
            <Button 
              className="w-full" 
              onClick={handleMintClick}
              disabled={isMinting}
            >
              {isMinting ? "Minting..." : `Mint ${quantity} NFT${quantity > 1 ? "s" : ""}`}
            </Button>
          ) : (
            <ConnectButton
              client={client}
              connectButton={{ style: { width: "100%" } }}
            />
          )}
        </CardFooter>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserisci i tuoi dati per procedere</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
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
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Annulla
              </Button>
              <ClaimButton
                theme={"light"}
                contractAddress={props.contract.address}
                chain={props.contract.chain}
                client={props.contract.client}
                claimParams={
                  props.isERC1155
                    ? {
                        type: "ERC1155",
                        tokenId: props.tokenId,
                        quantity: BigInt(quantity),
                        to: destinationAddress,
                        from: account?.address,
                      }
                    : props.isERC721
                    ? {
                        type: "ERC721",
                        quantity: BigInt(quantity),
                        to: destinationAddress,
                        from: account?.address,
                      }
                    : {
                        type: "ERC20",
                        quantity: String(quantity),
                        to: destinationAddress,
                        from: account?.address,
                      }
                }
                disabled={isMinting}
                onTransactionSent={() => {
                  toast.info("Transazione inviata");
                  setShowForm(false);
                }}
                onTransactionConfirmed={() => {
                  toast.success("NFT mintato con successo");
                  setIsMinting(false);
                }}
                onError={(err) => {
                  toast.error(err.message);
                  setIsMinting(false);
                }}
              >
                Conferma e Minta
              </ClaimButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}