import React from 'react'
import Img from '../assets/images/createToken.png'
import { useTheme } from "../contexts/ThemeContext";



function createToken() {
    const { isDarkMode, toggleDark } = useTheme();
    return (
        <div>
            <div className='panel '>

            </div>



            <div>
                <form >
                    <label >Enter your token name: </label>
                    <input type="text" name="tokenName" id="" />

                    <label >Enter total token supply: </label>

                </form>
            </div>

        </div>
    )
}

export default createToken
