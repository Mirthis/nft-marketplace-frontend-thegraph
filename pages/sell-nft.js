import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import nftAbi from '../constants/BasicNft.json';
import nftMarketplaceAbi from '../constants/NftMarketplace.json';
import { Form } from 'web3uikit';
import { ethers } from 'ethers';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import networkMapping from '../constants/networkMapping.json';
import { useNotification } from 'web3uikit';

export default function Home() {
  const { chainId } = useMoralis();
  const chainIdStr = chainId ? parseInt(chainId).toString() : '31337';
  const marketplaceAddress = networkMapping[chainIdStr]['NftMarketplace'][0];
  const dispatch = useNotification();

  const { runContractFunction } = useWeb3Contract();

  const approveAndList = async (data) => {
    console.log('Approving...');
    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = ethers.utils
      .parseUnits(data.data[2].inputResult, 'ether')
      .toString();
    console.log('nftAddress');
    console.log(nftAddress);

    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: 'approve',
      params: {
        to: marketplaceAddress,
        tokenId: tokenId
      }
    };

    await runContractFunction({
      params: approveOptions,
      onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
      onError: (error) => console.log(error)
    });
  };

  const handleApproveSuccess = async (nftAddress, tokenId, price) => {
    console.log('Listing...');

    const listOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: 'listI  tem',
      params: {
        nftAddress,
        tokenId,
        price
      }
    };

    await runContractFunction({
      params: listOptions,
      onSuccess: handleListSuccess,
      onError: (error) => console.log(error)
    });
  };

  const handleListSuccess = () => {
    dispatch({
      type: 'success',
      message: 'Nft Listing',
      type: 'Nft Listing',
      position: 'topR'
    });
  };

  return (
    <div className={styles.container}>
      <Form
        onSubmit={approveAndList}
        data={[
          {
            name: 'NFT Address',
            type: 'text',
            inputWidth: '50%',
            value: '',
            key: 'nftAddress'
          },
          {
            name: 'Token Id',
            type: 'number',
            value: '',
            key: 'tokenId'
          },
          {
            name: 'Price in ETH',
            type: 'number',
            value: '',
            key: 'price'
          }
        ]}
        title="Sell your NFT"
        id="sellForm"
      />
    </div>
  );
}
