import Moralis from "moralis-v1/node";
import "dotenv/config";
import { getContractAddresses, getNftMarketplaceAbi } from "./constants";

const chainId = process.env.chainId || 31337;
const moralisChainId = chainId == "31337" ? "1337" : chainId;
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
const appId = process.env.NEXT_PUBLIC_APP_ID;
const masterKey = process.env.masterKey;
const contractAddresses = getContractAddresses();
const contractAddress = contractAddresses[chainId]["NftMarketplace"][0];
const abi = getNftMarketplaceAbi();

async function main() {
    await Moralis.start({ serverUrl, appId, masterKey });
    console.log(`Working with Contract address ${contractAddress}`);

    const itemListedAbi = await getEventAbiByName("ItemListed");
    const itemListedOptions = {
        // Moralis understands a local chain is 1337
        chainId: moralisChainId,
        address: contractAddress,
        sync_historical: true,
        topic: "ItemListed(address,address,uint256,uint256)",
        abi: itemListedAbi,
        tableName: "ItemListed",
    };

    const itemBoughtAbi = await getEventAbiByName("ItemBought");
    const itemBoughtOptions = {
        chainId: moralisChainId,
        address: contractAddress,
        sync_historical: true,
        topic: "ItemBought(address,address,uint256,uint256)",
        abi: itemBoughtAbi,
        tableName: "ItemBought",
    };

    const itemCanceledAbi = await getEventAbiByName("ItemCanceled");
    const itemCanceledOptions = {
        chainId: moralisChainId,
        address: contractAddress,
        topic: "ItemCanceled(address,address,uint256)",
        sync_historical: true,
        abi: itemCanceledAbi,
        tableName: "ItemCanceled",
    };

    const listedResponse = await Moralis.Cloud.run("watchContractEvent", itemListedOptions, {
        useMasterKey: true,
    });
    const boughtResponse = await Moralis.Cloud.run("watchContractEvent", itemBoughtOptions, {
        useMasterKey: true,
    });
    const canceledResponse = await Moralis.Cloud.run("watchContractEvent", itemCanceledOptions, {
        useMasterKey: true,
    });

    if (listedResponse.success && canceledResponse.success && boughtResponse.success) {
        console.log("Success! Database Updated with watching events.");
    } else {
        console.log("Something went wrong ...");
    }
}

async function getEventAbiByName(eventName: string) {
    for (var i = 0; i < abi.length; i++) {
        if (abi[i].name === eventName && abi[i].type === "event") {
            return abi[i];
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
