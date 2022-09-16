import { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftAbi from "../constants/BasicNft.json";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import Image from "next/image";
import { Card, useNotification } from "web3uikit";
import { ethers } from "ethers";
import UpdateListingModal from "./UpdateListingModal";

interface NftBoxProps {
    price: number,
    nftAddress: string,
    tokenId: string,
    marketplaceAddress: string,
    seller: string,
}

const truncateStr = (fullStr: string, strLen: number) => {
    if(fullStr.length <= strLen) return fullStr;

    const separator = "...";
    const separatorLen = separator.length;
    const charsToShow = strLen - separatorLen;
    const frontChars = Math.ceil(charsToShow/2);
    const backChars = Math.floor(charsToShow/2);
    return (
        fullStr.substring(0, frontChars) + separator + fullStr.substring(fullStr.length - backChars)
    )
}

const NftBox = ({price, nftAddress, tokenId, marketplaceAddress, seller}: NftBoxProps) => {
    const [imageURI, setImageURI] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [toeknDescription, setTokenDescription] = useState("");
    const [showModal, setShowModal] = useState(false);
    const hideModal = () => setShowModal(false);
    const dispatch = useNotification();

    const { isWeb3Enabled, account } = useMoralis();

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        }
    }) 

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId
        }
    })

    async function updateUI(){
        const tokenURI = await getTokenURI();
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

    const isOwnedByUser = seller === account || seller === undefined;
    const formattedSeller = isOwnedByUser ? "you" : truncateStr(seller, 15);

    const handleCardClick = () => {
        isOwnedByUser
            ? setShowModal(true)
            : buyItem({
                onError: (error) => {
                    console.log(error);
                },
                onSuccess: () => {
                    handleBuyItemSuccess();
                }
            });
    }

    const handleBuyItemSuccess = () => {
        dispatch({
            type: "success",
            message: "Item bought!",
            title: "Item Bought",
            position: "topR"
        })
    }

    const renderImageURI = () => {
        return(
            <div className="mr-2"> 
                <UpdateListingModal 
                    isVisible={showModal}
                    tokenId={tokenId}
                    marketplaceAddress={marketplaceAddress}
                    nftAddress={nftAddress}
                    onClose={hideModal}
                    />
                <Card 
                    title={tokenName}
                    description={toeknDescription}
                    onClick={handleCardClick}>
                    <div className="p-2">
                        <div className="flex flex-col items-end gap-2">
                            <div>#{tokenId}</div>
                            <div className="italic text-sm">Owned by {formattedSeller}</div>
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