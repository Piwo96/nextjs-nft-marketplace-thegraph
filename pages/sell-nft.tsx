import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Form, useNotification, Button, Information } from "web3uikit";
import { useState } from "react";
import { ethers } from "ethers";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftAbi from "../constants/BasicNft.json";
import marketplaceAbi from "../constants/NftMarketplace.json";
import contractAddresses from "../constants/contractAddresses.json";
import { ContractAddressesInfo } from "../constants";
import { useEffect } from 'react';

const Home: NextPage = () => {
  const [proceeds, setProceeds] = useState("0");
  const { chainId, isWeb3Enabled, account } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = (contractAddresses as ContractAddressesInfo)[chainString].NftMarketplace[0];
  const dispatch = useNotification();

  // @ts-ignore
  const { runContractFunction } = useWeb3Contract();
  const { runContractFunction: getProceeds } = useWeb3Contract({
    abi: marketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "getProceeds",
    params:{
      seller: account
    }
  });

  useEffect(() => {
    if(isWeb3Enabled){
      updatUI();
    }
  }, [isWeb3Enabled])

  async function updatUI(){
    const proceeds = await getProceeds();
    if(proceeds){
      setProceeds(((proceeds as number)/1e18).toString());
    }
  }

  async function approveAndList(data: any){
    console.log("Approving ...");
    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString();

    const options = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId
      }
    }

    await runContractFunction({
      params: options,
      onError: (error) => {
        console.log(error);
      },
      onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price)
    });
  }

  async function handleApproveSuccess(nftAddress: string, tokenId: number, price: string){
    console.log("Ok! Now time to list!");
    const listOptions = {
      abi: marketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: price
      }
    }

    await runContractFunction({
      params: listOptions,
      onError: (error) => {
        console.log(error);
      },
      onSuccess: () => handleListSuccess()
    })
  }

  async function handleListSuccess(){
    dispatch({
      type: "success",
      message: "NFT lising",
      title: "NFT listed",
      position: "topR"
    })
  }

  async function withdrawProceeds(){
    if(proceeds !== "0"){
      const withdrawOptions = {
        abi: marketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "withdrawProceeds",
      }
  
      await runContractFunction({
        params: withdrawOptions,
        onError: (error) => {
          console.log(error);
        },
        onSuccess: () => handleWithdrawSuccess()
      })
    }
  }

  async function handleWithdrawSuccess(){
    dispatch({
      type: "success",
      message: "Proceeds withdrawn",
      title: "Withdraw Proceeds",
      position: "topR"
    })
  }

  return (
    <div className={styles.container}>
      <Form
        onSubmit={approveAndList}
        title="Sell your NFT"
        id="Main Form"
        buttonConfig={
          {
            theme: "primary",
            text: "submit"
          }
        }
        data={[
          {
            name: "Nft Address",
            type: "text",
            value: "",
            key: "nftAddress"
          },
          {
            name: "Token ID",
            type: "number",
            value: "",
            key: "tokenId"
          },
          {
            name: "Price (in ETH)",
            type: "number",
            value: "",
            key: "price"
          }
        ]}
        />
      <div className='pl-3'>
        <div className="py-2 w-fit">
          <Information
            information={`${proceeds} ETH`}
            topic="Your Balance"
            />
        </div>
        <Button 
          text="Withdraw Proceeds"
          theme='colored'
          size='large'
          color="green"
          onClick={withdrawProceeds}
          />
      </div>
      
    </div>
  )
}

export default Home
