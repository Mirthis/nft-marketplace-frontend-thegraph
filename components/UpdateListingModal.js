import { useState } from 'react';
import { Modal, Input, useNotification } from 'web3uikit';
import { useWeb3Contract } from 'react-moralis';
import nftMarketplaceAbi from '../constants/NftMarketplace.json';
import { ethers } from 'ethers';

const UpdateListingModal = ({
  nftAddress,
  tokenId,
  isVisible,
  marketplaceAddress,
  onClose
}) => {
  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);
  const dispatch = useNotification();

  const handleUpdateListingSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: 'success',
      message: 'Listing updated',
      title: 'Listing updated (please refresh and move blocks)',
      position: 'topR'
    });
    onClose && onClose();
    setPriceToUpdateListingWith('0');
  };

  const { runContractFunction: updateListing } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: 'updateListing',
    params: {
      nftAddress,
      tokenId,
      newPrice: ethers.utils.parseEther(priceToUpdateListingWith || '0')
    }
  });

  return (
    <Modal
      isVisible={isVisible}
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={() =>
        updateListing({
          onError: (error) => console.log(error),
          onSuccess: handleUpdateListingSuccess
        })
      }
    >
      <Input
        label="Update listing price in L1 currency (ETH)"
        name="New  listing price"
        tyoe="number"
        onChange={(event) => {
          console.log('Onchage - Updated listing value:');
          console.log(event.target.value);
          setPriceToUpdateListingWith(event.target.value);
        }}
      />
    </Modal>
  );
};

export default UpdateListingModal;
