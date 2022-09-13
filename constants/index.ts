import fs from "fs";

interface ContractAddressesInfo {
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

export const getAbi = () => {
    const abi = JSON.parse(fs.readFileSync("constants/abi.json", "utf-8"));
    return abi;
};
