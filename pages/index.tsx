import type { NextPage } from 'next'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useMoralisQuery, useMoralis } from "react-moralis";
import NftBox from "../components/NftBox";


const Home: NextPage = () => {
  const { isWeb3Enabled } = useMoralis();
  const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
    // TableName
    // Function for the query
    "ActiveItem",
    (query) => query.limit(10).descending("tokenId")
  );
  console.log(listedNfts);


  const renderFetchingNfts = () => {
    return(
      <div>Loading ...</div>
    )
  }

  const renderNftsFetched = () => {
    return(
      <div className="container mx-auto">
        <h1 className='py-4 px-4 font-bold txt-2xl'>Recently Listed</h1>
          <div className='flex flex-wrap'>
            {listedNfts.map((nft, index) => {
              console.log(nft.attributes);
              const {price, nftAddress, tokenId, marketplaceAddress, seller} = nft.attributes;
              return (
                <div>
                  <NftBox 
                    price={price} 
                    nftAddress={nftAddress} 
                    tokenId={tokenId} 
                    marketplaceAddress={marketplaceAddress}
                    seller={seller}
                    key={index}/>
                </div>)
            })}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
        {isWeb3Enabled
          ? (fetchingListedNfts ? renderFetchingNfts() : renderNftsFetched())
          : <div>Please connect your wallet</div>}
    </div>
  )
}

export default Home
