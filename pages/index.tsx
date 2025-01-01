import { NextPage } from "next"

import { NftMint } from "../components/nft/form/nft-mint";
import {
  defaultChainId,
  defaultNftContractAddress,
  defaultTokenId,
} from "../hooks/lib/constants";
import { client } from "../hooks/lib/thirdwebClient";
import { defineChain, getContract, toTokens } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";
import {
  getActiveClaimCondition as getActiveClaimCondition1155,
  getNFT,
  isERC1155,
} from "thirdweb/extensions/erc1155";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";
import {
  getActiveClaimCondition as getActiveClaimCondition721,
  isERC721,
} from "thirdweb/extensions/erc721";
import { getActiveClaimCondition as getActiveClaimCondition20 } from "thirdweb/extensions/erc20";
import { useReadContract } from "thirdweb/react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function NftMintContent() {
    const searchParams = useSearchParams();
    
    useEffect(() => {
        const status = searchParams.get('status');
        const hasRedirected = sessionStorage.getItem('hasRedirected');
        
        if (!status && !hasRedirected) {
            sessionStorage.setItem('hasRedirected', 'true');
            window.location.href = "https://buy.stripe.com/bIYg2iaOlbjM6nmfYZ";
        }
    }, [searchParams]);
  
    const tokenId = defaultTokenId;
    const chain = defineChain(defaultChainId);
    const contract = getContract({
      address: defaultNftContractAddress,
      chain,
      client,
    });
    const isERC721Query = useReadContract(isERC721, { contract });
    const isERC1155Query = useReadContract(isERC1155, { contract });
    const contractMetadataQuery = useReadContract(getContractMetadata, {
      contract,
    });
  
    const nftQuery = useReadContract(getNFT, {
      contract,
      tokenId,
      queryOptions: { enabled: isERC1155Query.data },
    });
  
    const claimCondition1155 = useReadContract(getActiveClaimCondition1155, {
      contract,
      tokenId,
      queryOptions: {
        enabled: isERC1155Query.data,
      },
    });
  
    const claimCondition721 = useReadContract(getActiveClaimCondition721, {
      contract,
      queryOptions: { enabled: isERC721Query.data },
    });
  
    const claimCondition20 = useReadContract(getActiveClaimCondition20, {
      contract,
      queryOptions: { enabled: !isERC721Query.data && !isERC1155Query.data },
    });
  
    const displayName = isERC1155Query.data
      ? nftQuery.data?.metadata.name
      : contractMetadataQuery.data?.name;
  
    const description = isERC1155Query.data
      ? nftQuery.data?.metadata.description
      : contractMetadataQuery.data?.description;
  
    const priceInWei = isERC1155Query.data
      ? claimCondition1155.data?.pricePerToken
      : isERC721Query.data
        ? claimCondition721.data?.pricePerToken
        : claimCondition20.data?.pricePerToken;
  
    const currency = isERC1155Query.data
      ? claimCondition1155.data?.currency
      : isERC721Query.data
        ? claimCondition721.data?.currency
        : claimCondition20.data?.currency;
  
    const currencyContract = getContract({
      address: currency || "",
      chain,
      client,
    });
  
    const currencyMetadata = useReadContract(getCurrencyMetadata, {
      contract: currencyContract,
      queryOptions: { enabled: !!currency },
    });
  
    const currencySymbol = currencyMetadata.data?.symbol || "";
  
    const pricePerToken =
      currencyMetadata.data && priceInWei !== null && priceInWei !== undefined
        ? Number(toTokens(priceInWei, currencyMetadata.data.decimals))
        : null;
  
    return (
      <NftMint
        contract={contract}
        displayName={displayName || ""}
        contractImage={contractMetadataQuery.data?.image || ""}
        description={description || ""}
        currencySymbol={currencySymbol}
        pricePerToken={pricePerToken}
        isERC1155={!!isERC1155Query.data}
        isERC721={!!isERC721Query.data}
        tokenId={tokenId}
      />
    );
  }

const Home: NextPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NftMintContent />
        </Suspense>
    );
}

export default Home;