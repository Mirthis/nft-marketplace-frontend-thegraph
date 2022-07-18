import styles from "../styles/Home.module.css";
import { useMoralis, useMoralisQuery } from "react-moralis";
import NftBox from "../components/NftBox";
import networkMapping from "../constants/networkMapping.json";
import { useQuery } from "@apollo/client";
import { GET_ACTIVE_ITEMS } from "../constants/subGraphQueries";

export default function Home() {
  const { isWeb3Enabled, account, chainId } = useMoralis();
  const chainIdStr = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = networkMapping[chainIdStr]["NftMarketplace"][0];

  const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

  return (
    <div className="container mx-auto">
      <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
      <div className="flex flew-wrap">
        {isWeb3Enabled ? (
          loading || !listedNfts ? (
            <div>Loading...</div>
          ) : (
            listedNfts.activeItems.map((nft) => {
              console.log(nft.attributes);
              const { price, nftAddress, tokenId, marketplaceAddress, seller } =
                nft;
              return (
                <div key={`${nftAddress}-${tokenId}`}>
                  <NftBox
                    key={`${nftAddress}-${tokenId}`}
                    price={price}
                    nftAddress={nftAddress}
                    tokenId={tokenId}
                    marketplaceAddress={marketplaceAddress}
                    seller={seller}
                  />
                </div>
              );
            })
          )
        ) : (
          <div>Web3 is not enabled</div>
        )}
      </div>
    </div>
  );
}
