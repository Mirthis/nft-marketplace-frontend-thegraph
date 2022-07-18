const Moralis = require('moralis/node');
const moralis = require('moralis/node');
require('dotenv').config();
const contractAddresses = require('./constants/networkMapping.json');

const chainId = process.env.chainId || 31337;
const moralisChainId = chainId === '31337' ? '1337' : chainId;

const {
  NEXT_PUBLIC_SERVER_URL: serverUrl,
  NEXT_PUBLIC_APP_ID: appId,
  masterKey,
} = process.env;

const contractAddress = contractAddresses[chainId]['NftMarketplace'][0];

const main = async () => {
  await Moralis.start({ serverUrl, masterKey, appId });
  console.log(`Working with contract ${contractAddress}`);

  const itemListedOptions = {
    chainId: moralisChainId,
    sync_historical: true,
    address: contractAddress,
    topic: 'ItemListed(address,address,uint256,uint256)',
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'seller',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nftAddress',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'price',
          type: 'uint256',
        },
      ],
      name: 'ItemListed',
      type: 'event',
    },
    tableName: 'ItemListed',
  };

  const itemSoldOptions = {
    chainId: moralisChainId,
    sync_historical: true,
    address: contractAddress,
    topic: 'ItemSold(address,address,uint256,uint256)',
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'seller',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nftAddress',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'price',
          type: 'uint256',
        },
      ],
      name: 'ItemSold',
      type: 'event',
    },
    tableName: 'ItemSold',
  };

  const itemCancelledOptions = {
    chainId: moralisChainId,
    sync_historical: true,
    address: contractAddress,
    topic: 'ItemCancelled(address,address,uint256)',
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'seller',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nftAddress',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'ItemCancelled',
      type: 'event',
    },
    tableName: 'ItemCancelled',
  };

  const listedReponse = await Moralis.Cloud.run(
    'watchContractEvent',
    itemListedOptions,
    { useMasterKey: true },
  );

  const soldReponse = await Moralis.Cloud.run(
    'watchContractEvent',
    itemSoldOptions,
    { useMasterKey: true },
  );

  const cancelledReponse = await Moralis.Cloud.run(
    'watchContractEvent',
    itemCancelledOptions,
    { useMasterKey: true },
  );

  if (
    listedReponse.success &&
    soldReponse.success &&
    cancelledReponse.success
  ) {
    console.log('Moralis updated to listen for all the events!');
  } else {
    console.log('Something went wrong in adding event listeners!');
    console.log('Listed Response:');
    console.log(listedReponse);
    console.log('Sold Response:');
    console.log(soldReponse);
    console.log('Cancelled Response:');
    console.log(cancelledReponse);
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
