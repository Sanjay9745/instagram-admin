"use client"
import Sidebar from '@/components/Sidebar'
import SERVER_URL from '@/utils/SERVER_URL'
import axios from 'axios'
import { useRouter } from 'next/navigation'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
function Page({params}:any) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()
    const {id} = params
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login")
        } 
        axios.get(SERVER_URL + "/admin/protected", {
            headers:{
                'x-access-token': token
            }
        }).then((res) => {
            if(res.status ===200){
                axios.get(SERVER_URL + "/admin/user/"+id, {
                    headers:{
                        'x-access-token': token
                    }
                }).then((res) => {
                    console.log(res.data.user)
                    setUsername(res.data.user.username);
                    setPassword(res.data.user.password);
                })
            }
        })
    },[])
    const handleSubmit = () => {
        if (!username || !password) {
            return toast.error("Please fill all the fields")
        }
        axios.put(SERVER_URL + "/admin/update-user/"+id, {
            username,
            password
        },{
            headers:{
                'x-access-token': localStorage.getItem("token")
            }
        }
        ).then((res) => {
            toast.success("User added successfully");
            setUsername("")
            setPassword("")
        }).catch((err) => {
            toast.error("User not added")
        })

    }
    return (
        <>
            <Sidebar>
                <div className="max-w-sm mx-auto mt-36">
                    <h1 className="text-2xl font-bold mb-5">Update User</h1>
                    <div className="mb-5">
                        <label
                            htmlFor="username"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Your username
                        </label>
                        <input
                            type="username"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                            placeholder="name"

                        />
                    </div>
                    <div className="mb-5">
                        <label
                            htmlFor="password"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Your password
                        </label>
                        <input
                            value={password}
                            type="password"
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"

                        />
                    </div>


                    <button
                        onClick={handleSubmit}
                        type="submit"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                       Update User
                    </button>
                </div>

            </Sidebar>
        </>
    )
}

export default Page