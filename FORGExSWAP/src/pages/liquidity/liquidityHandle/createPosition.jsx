import React from 'react'

function createPosition() {
    return (
        <div className="p-6 justify-center flex dark:bg-slate-950 min-h-screen">
            <div className='p-4 border-1 h-full rounded-md w-[40%] bg-gray-50 dark:bg-gray-900 border-gray-400'>
                <form action="" className='flex flex-col space-y-8' method="post">
                    <div>
                        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
                            Create Positions
                        </h1>
                    </div>


                    <div className='flex flex-col p-2 space-y-2'>
                        <label className="block text-gray-600 dark:text-gray-300 text-md font-medium">
                            Select Tokens
                        </label>
                        <div className='flex space-x-4 justify-between '>
                            <select className='w-[50%] font-normal border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none' name="token0" id="">
                                <option value="">Hey</option>
                                <option value="">Hello</option>
                            </select>

                            <select className='w-[50%] font-normal border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none' name="token1" id="">
                                <option value="">Hey</option>
                                <option value="">Hello</option>
                            </select>
                        </div>
                    </div>

                    <div className='flex flex-col space-y-2'>
                        <label className="block text-gray-600 dark:text-gray-300 text-md font-medium">
                            Deposit Tokens
                        </label>
                        <div className='flex flex-col space-y-4'>
                            <div className='w-full flex border-gray-300 dark:border-gray-600 rounded-lg px-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 '>
                                <input className=' w-[80%]  rounded-lg px-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none' type="text" />
                                <div></div>
                            </div>
                            <div className='w-full flex border-gray-300 dark:border-gray-600 rounded-lg px-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 '>
                                <input className='w-[80%]  rounded-lg px-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none' type="text" />
                                <div></div>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center'><button className='w-full py-3 rounded-lg font-semibold transition duration-200 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white' type="submit">Submit</button></div>
                </form>
            </div>
        </div>
    )
}

export default createPosition