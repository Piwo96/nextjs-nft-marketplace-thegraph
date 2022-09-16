import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import { useMoralis } from "react-moralis";
import { useQuery } from "@apollo/client";
import NftBox from "../components/NftBox";
import { ContractAddressesInfo } from "../constants";
import contractAddresses from "../constants/contractAddresses.json";
import GET_ACTIVE_ITEMS from '../constants/subfraphQueries';

const Home: NextPage = () => {
  const { chainId, isWeb3Enabled } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = (contractAddresses as ContractAddressesInfo)[chainString].NftMarketplace[0];

  const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

  const renderFetchingNfts = () => {
    return(
      <div>Loading ... </div>
    )
  }

  const renderNftsFetched = () => {
    return(
      <div className="container mx-auto">
        <h1 className='py-4 px-4 font-bold txt-2xl'>Recently Listed</h1>
          <div className='flex flex-wrap'>
            {listedNfts.activeItems.map((nft: any) => {
              const {price, nftAddress, tokenId, seller} = nft;
              return (
                <div>
                  <NftBox 
                    price={price!} 
                    nftAddress={nftAddress!} 
                    tokenId={tokenId!} 
                    marketplaceAddress={marketplaceAddress}
                    seller={seller!}/>
                </div>)
            })}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
        {isWeb3Enabled
          ? (loading || !listedNfts ? renderFetchingNfts() : renderNftsFetched())
          : <div>Please connect your wallet</div>}
    </div>
  )
}

export default Home
