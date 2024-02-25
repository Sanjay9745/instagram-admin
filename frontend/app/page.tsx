"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function Page() {
  const router =  useRouter()
  useEffect(() => {
    if(localStorage.getItem("token")){
      router.push("/all-users")
    }else{
      router.push("/login")
    }
  },[])
  return (
    <div>page</div>
  )
}

export default Page