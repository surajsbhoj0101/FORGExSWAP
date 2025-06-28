import React, { useState } from 'react'
import { handleTokenCreation } from '../utils/handleTokenCreation';
import { useAccount, useWalletClient } from 'wagmi';
import { addLiquidity } from '../utils/addLiquidity';
import { BrowserProvider, ZeroAddress } from 'ethers';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ToastContainer from '../components/toastContainer';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FilePen } from 'lucide-react';


function createToken() {
    const fswapAddress = "0x81D1eb8037C47E329900A3bf8a78814bc259c770";
    const [isCreatingToken, setIsCreatingToken] = useState(false) 
    const { data: walletClient } = useWalletClient();//object destructuring with aliasing.
    /* 
        data give :
            {
            data: { ...walletClientObject },
            isLoading: false,
            isError: false,
            status: 'success'
            }

    */
    const { isConnected, address } = useAccount();
    const formData = new FormData();//creates an empty FormData object and used to send form fields (text, files, etc.) from frontend to backend. 
    const [tokenData, setTokenData] = useState({
        tokenName: "",
        tokenSymbol: "",
        tokenSupply: "",
        fswapForInitialLiquidity: "",
        image: ""
    })

    function handleTokenData(e) {
        const { name, value, files } = e.target
        if (name === 'image' && files && files[0]) {
            const file = files[0];
            const imageURL = URL.createObjectURL(file);//This generates a temporary local URL that lets you preview the uploaded file without uploading it.
            console.log("ImageUrl",file)
            /*
                file is a JavaScript File object with properties like:

                file.name        // filename (e.g., "dog.png")
                file.type        // MIME type (e.g., "image/png")
                file.size   
            */
            
            setTokenData(prev => ({
                ...prev,
                image: imageURL,   // or store file object instead, if you plan to upload
                imageFile: file    // optional: save raw file
            }));
        } else {
            setTokenData((prev) => ({
                ...prev, //spread and replace the field that matches the name
                [name]: value,
            }))
        }
    }

    async function hanldeTokenCreation(e) {
        e.preventDefault(); //prevent Form submission from reloading page
        if (!tokenData.tokenName || !tokenData.tokenSupply || !tokenData.tokenSymbol || !tokenData.fswapForInitialLiquidity || !tokenData.image) {
            console.log("all field mandatory");
            return;
        }
        try {
            setIsCreatingToken(true)
            const provider = new BrowserProvider(walletClient);
            const signer = await provider.getSigner();//converts a wallet client (like MetaMask) into a signer
            const customToken = await handleTokenCreation(tokenData.tokenName, tokenData.tokenSymbol, tokenData.tokenSupply, signer);
            if (!customToken.isTxSuccessful) { 
                toast.error("Token Creation failed")
                return
            }
            toast.success("Token Creation Successfull, Now wait for to add liquidity")
            const liqAdd = await addLiquidity(customToken.address, tokenData.tokenSupply, tokenData.fswapForInitialLiquidity, signer, address)
            if (!liqAdd.isTxSuccessful) {
                toast.error("Liquidity addition failed");
                return;
            }

            toast.success("Liquidty addition successfull, Now wait while we add your data")
            const file = tokenData.imageFile
            console.log('file-',file);
            formData.append('image',file)
            
            const resImage = await axios.post('http://localhost:3002/upload',formData,{
                headers:{
                    'Content-Type':'multipart/form-data' // telling the browser and server that this is a file upload using multipart/form-data.
                }
            });

            if(!resImage.data.success){
                toast.warn("Image upload fail, adding a random image")
            }

            toast.info("saving your Data now to our servers ...")

            const res = await axios.post("http://localhost:3002/tokenData", {
                "pairName": tokenData.tokenSymbol + "/FSwap",
                "pairAddress": liqAdd.pairAddress,
                "customTokenName": tokenData.tokenName,
                "fswapTokenName": "FORGEXSWAP",
                "customToken": customToken.address,
                "fswapAddress": fswapAddress,
                "customTokenTotalSupply": tokenData.tokenSupply,
                "fswapTotalSupply": "10000",
                "customTokenForLiquidity": (tokenData.tokenSupply*9)/10,
                "customTokenSupplyForLiquidity":tokenData.fswapForInitialLiquidity,
                "cutomTokenImage": resImage.data.cid || "bafybeigztycdf3f3zc3cugrt7fivb2rmlph7u2blcmjgeiwbw3tu565ptm",
            })

            if(!res.data.success){
                toast.error("Token Data could nout be added in the servers ");
                return
            }

            toast.success(`Your token creation is successfull ${res.data.data}`)


        } catch (error) {
            console.log("Failed to create token", error)
        } finally {
            setTokenData(prev => ({
                ...prev,
                tokenName: "",
                tokenSymbol: "",
                tokenSupply: "",
                fswapForInitialLiquidity: "",
                image: ""
            }))
            setIsCreatingToken(false);
        }
    }



    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <ToastContainer />
            <div className="dark:bg-gray-800 shadow-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-white text-center px-4 py-16 flex flex-col justify-center items-center space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                    Test, build, and grow
                </h1>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium">
                    Create your Sepolia tokens
                </h2>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                    Now and shape the future
                </h1>
            </div>

            {/* Form Section */}
            <div className="flex-grow bg-gray-200 dark:bg-gray-950 dark:text-white text-gray-800 flex justify-center items-center px-4 py-12">
                <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-lg p-6 space-y-6">
                    <h1 className="text-3xl font-bold text-center mb-4">Create Your Token</h1>

                    <form className="flex flex-col  gap-4"  method="post" encType='multipart/form-data' onSubmit={hanldeTokenCreation}>
                        <div>
                            <label htmlFor="tokenName" className="block mb-1 font-medium">Token Name</label>
                            <input
                                required
                                onChange={handleTokenData}
                                value={tokenData.tokenName}
                                type="text"
                                name="tokenName"
                                id="tokenName"
                                className="w-full border dark:text-white border-gray-400 rounded px-3 py-2 text-gray-900"
                                placeholder="MyToken"
                            />
                        </div>

                        <div>
                            <label htmlFor="tokenSymbol" className="block mb-1 font-medium">Token Symbol</label>
                            <input
                                required
                                onChange={handleTokenData}
                                type="text"
                                value={tokenData.tokenSymbol}
                                name="tokenSymbol"
                                id="tokenSymbol"
                                className="w-full border dark:text-white border-gray-400 rounded px-3 py-2 text-gray-900"
                                placeholder="MT"
                            />
                        </div>

                        <div>
                            <label htmlFor="tokenSupply" className="block mb-1 font-medium">Token Supply</label>
                            <input
                                required
                                onChange={handleTokenData}
                                min='1'
                                value={tokenData.tokenSupply}
                                type="number"
                                name="tokenSupply"
                                id="tokenSupply"
                                className="w-full border dark:text-white border-gray-400 rounded px-3 py-2 text-gray-900"
                                placeholder="1000"
                            />
                        </div>

                        <div>
                            <label htmlFor="tokenLiquidity" className="block mb-1 font-medium">Enter Fswap to add initial liquidity min 1 </label>
                            <input
                                required
                                onChange={handleTokenData}
                                min="1"
                                value={tokenData.fswapForInitialLiquidity}
                                type="number"
                                name="fswapForInitialLiquidity"
                                id="liquidity"
                                className="w-full border dark:text-white border-gray-400 rounded px-3 py-2 text-gray-900"
                                placeholder="1000"
                            />
                        </div>

                        <div className='border-gray-400 rounded-lg flex items-center justify-between border px-3 py-2'>
                            <div className='flex flex-col items-center justify-center'>
                                <label htmlFor="tokenImage" className="block mb-1 font-medium">Upload Token Image</label>
                                <label htmlFor="tokenImage" className="block mb-1 font-medium">max size 1mb</label>
                            </div>
                            {tokenData.image ? (
                                <img src={tokenData.image} className="w-1/3 border-dashed h-30 rounded-full overflow-hidden  px-3 py-2" alt="preview" />

                            ) : (<input
                                required
                                type="file"
                                accept="image/*"
                                name="image"
                                onChange={handleTokenData}
                                className="w-1/3 border-dashed dark:text-white h-30 border-2 rounded-lg border-gray-400  px-3 py-2"
                            />)}
                        </div>

                        <div className='flex justify-center items-center'>
                            {isConnected ? (<button
                                type="submit"
                                disabled={isCreatingToken}
                                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white py-3 rounded font-semibold transition"
                            >
                                {isCreatingToken ? "Creating please wait ..." : "Create Token"}
                            </button>) : (<ConnectButton />)}
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default createToken
