import fs from "fs";

export interface ContractAddressesInfo {
    [chainId: string]: ContractItem;
}

interface ContractItem {
    [contractName: string]: string[];
}

export const getContractAddresses = () => {
    const contractAddresses: ContractAddressesInfo = JSON.parse(
        fs.readFileSync("constants/contractAddresses.json", "utf-8")
    );
    return contractAddresses;
};

export const getNftMarketplaceAbi = () => {
    const abi = JSON.parse(fs.readFileSync("constants/NftMarketplace.json", "utf-8"));
    return abi;
};

export const getBasicNftAbi = () => {
    const abi = JSON.parse(fs.readFileSync("constants/BasicNft.json", "utf-8"));
    return abi;
};
