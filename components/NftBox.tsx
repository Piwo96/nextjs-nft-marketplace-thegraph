import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftAbi from "../constants/BasicNft.json";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import Image from "next/image";
import { Card } from "web3uikit";
import { ethers } from "ethers";

interface NftBoxProps {
    price: number,
    nftAddress: string,
    tokenId: string,
    marketplaceAddress: string,
    seller: string,
}

const NftBox: NextPage<NftBoxProps> = ({price, nftAddress, tokenId, marketplaceAddress, seller}: NftBoxProps) => {
    const [imageURI, setImageURI] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [toeknDescription, setTokenDescription] = useState("");

    const { isWeb3Enabled } = useMoralis();

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        }
    }) 

    async function updateUI(){
        const tokenURI = await getTokenURI();
        console.log(`The TokenURI is: ${tokenURI}`);
        if(tokenURI){
            const requestURL = tokenURI.toString().replace("ipfs://", "https://ipfs.io/ipfs/");
            const tokenURIResponse = await (await fetch(requestURL)).json();
            const imageURI = tokenURIResponse.image;
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");
            setImageURI(imageURIURL);
            setTokenName(tokenURIResponse.name);
            setTokenDescription(tokenURIResponse.description);
        }
    }

    useEffect(() => {
        if(isWeb3Enabled){
            updateUI()
        }
    }, [isWeb3Enabled])

    const renderImageURI = () => {
        return(
            <div> 
                <Card 
                    title={tokenName}
                    description={toeknDescription}>
                    <div className="p-2">
                        <div className="flex flex-col items-end gap-2">
                            <div>#{tokenId}</div>
                            <div className="italic text-sm">Owned by {seller}</div>
                            <Image 
                                loader={() => imageURI}
                                src={imageURI}
                                height="200"
                                width="200"/>   
                            <div className="font-bold">
                                {ethers.utils.formatUnits(price, "ether")} ETH
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    const renderNoImageURI = () => {
        return (
            <div>Loading ...</div>
        )
    }

    return (
        <div>
            {imageURI ? renderImageURI() : renderNoImageURI()}
        </div>
    );
}

export default NftBox;