import { useState, useEffect } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import nftMarketplaceAbi from '../constants/NftMarketplace.json';
import nftAbi from '../constants/BasicNft.json';
import Image from 'next/image';
import { Card } from 'web3uikit';
import { ethers } from 'ethers';
import UpdateListingModal from './UpdateListingModal';
import { useNotification } from 'web3uikit';

const truncateString = (fullString, strLength) => {
  if (fullString.length <= strLength) return fullString;

  const separator = '...';
  const separatorLength = separator.length;
  const charsToShow = strLength - separatorLength;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    fullString.substring(0, frontChars) +
    separator +
    fullString.substring(fullString.length - backChars)
  );
};

const NftBox = ({ price, nftAddress, tokenId, marketplaceAddress, seller }) => {
  const [imageURI, setImageURI] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [showModal, setShowModal] = useState(false);
  const hideModal = () => setShowModal(false);

  const dispatch = useNotification();

  const { isWeb3Enabled, account } = useMoralis();

  const isOwnedByUser = seller == account || seller == undefined;
  const formattedSellerAddress = isOwnedByUser
    ? 'you'
    : truncateString(seller || '', 15);

  const { runContractFunction: getTokenURI } = useWeb3Contract({
    abi: nftAbi,
    contractAddress: nftAddress,
    functionName: 'tokenURI',
    params: { tokenId }
  });

  useEffect(() => {
    const updateUI = async () => {
      const tokenURI = await getTokenURI();
      console.log(`tokenURI: ${tokenURI}`);
      if (tokenURI) {
        const requestURL = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
        console.log(`requestUrl: ${requestURL}`);
        const tokenURIResponse = await (await fetch(requestURL)).json();
        const imageURI = tokenURIResponse.image;
        console.log(`imageURI: ${imageURI}`);
        const imageURIURL = imageURI.replace(
          'ipfs://',
          'https://ipfs.io/ipfs/'
        );
        console.log(`imageUrl: ${imageURIURL}`);
        setImageURI(imageURIURL);
        setTokenName(tokenURIResponse.name);
        setTokenDescription(tokenURIResponse.description);
      }
    };
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled, getTokenURI]);

  console.log({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: 'buyItem',
    msgValue: price,
    params: {
      nftAddress,
      tokenId
    }
  });

  const { runContractFunction: buyItem } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: 'buyItem',
    msgValue: price,
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId
    }
  });

  const handleBuyItemSuccess = () => {
    dispatch({
      type: 'success',
      title: 'Item Bougth',
      description: 'Item Bought',
      position: 'topR'
    });
  };

  const handleCardClick = () => {
    isOwnedByUser
      ? setShowModal(true)
      : buyItem({
          onError: (error) => console.log(error),
          onSuccess: handleBuyItemSuccess
        });
  };

  return (
    <div>
      <div>
        <UpdateListingModal
          isVisible={showModal}
          tokenId={tokenId}
          marketplaceAddress={marketplaceAddress}
          nftAddress={nftAddress}
          onClose={hideModal}
        />
        {imageURI ? (
          <div>
            <Card
              title={tokenName}
              description={tokenDescription}
              onClick={handleCardClick}
            >
              <div className="p-2">
                <div className="flex flex-col items-end gap-2">
                  <div>#{tokenId}</div>
                  <div className="italic text-sm">
                    Owned by {formattedSellerAddress}
                  </div>
                  <Image
                    loader={() => imageURI}
                    src={imageURI}
                    height="200"
                    width="200"
                    alt="nft"
                  />
                  <div className="font-bold">
                    {ethers.utils.formatUnits(price, 'ether')} ETH
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default NftBox;
