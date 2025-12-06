"use client";

import { useSelector } from 'react-redux';

const userAuth = () => {

    const user = useSelector((state) => state?.auth?.user);
    if(user){
        return true
    }else{
        return false
    }
}

export default userAuth;