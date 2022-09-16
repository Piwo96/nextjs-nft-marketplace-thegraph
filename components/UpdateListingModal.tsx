import { Modal, Input, useNotification } from "web3uikit";
import { useState } from "react"
import { useWeb3Contract } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import { ethers } from "ethers";

interface UpdatListingModalProps {
    nftAddress?: string,
    tokenId?: string,
    isVisible: boolean,
    marketplaceAddress?: string,
    onClose?: () => void,
}

const UpdatListingModal = ({nftAddress, tokenId, isVisible, marketplaceAddress, onClose = () => {}}: UpdatListingModalProps) => {
    const dispatch = useNotification();
    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState("0");

    const handleUpdateListingSuccess = async (tx: any) => {
        await tx.wait(1);
        dispatch({
            type: "success",
            message: "listing updated",
            title: "Listing updated - please refresh (and move blocks)",
            position: "topR"
        });
        onClose && onClose();
        setPriceToUpdateListingWith("0");
    }

    const {runContractFunction: updateListing} = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: ethers.utils.parseEther(priceToUpdateListingWith)
        }
    })

    return (
        <Modal isVisible={isVisible}
            onOk={() => {
                updateListing({
                    onError: (error) => console.log(error),
                    onSuccess: handleUpdateListingSuccess
                })
            }}
            onCancel={onClose}
            onCloseButtonPressed={onClose}>
            <Input 
                label="Update listing price in l1 Currency (Eth)"
                name="New listing price"
                type="text"
                onChange={(event) => {
                    setPriceToUpdateListingWith(event.target.value);
                }}/>
        </Modal>
    );
}
 
export default UpdatListingModal;