"use client"
import Sidebar from '@/components/Sidebar'
import SERVER_URL from '@/utils/SERVER_URL'
import axios from 'axios'
import { useRouter } from 'next/navigation'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function Page() {
    const [url, setUrl] = useState("")

    const router = useRouter()
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login")
        }
        axios.get(SERVER_URL + "/admin/protected", {
            headers: {
                'x-access-token': token
            }
        }).then((res) => {
            if (res.status !== 200) {
                router.push("/login")
            }
        })
    }, [])
    const handleSubmit = () => {
        if (!url) {
            return toast.error("Please fill the username")
        }
        axios.post(SERVER_URL + "/admin/send-followers", {
            username:url,
        }, {
            headers: {
                'x-access-token': localStorage.getItem("token")
            }
        }
        ).then((res) => {
            toast.success("Follow added successfully");
            setUrl("")
        }).catch((err) => {
            toast.error("Something Went Wrong")
        })

    }
    return (
        <>
            <Sidebar>
                <div className="max-w-sm mx-auto mt-36">
                    <h1 className="text-2xl font-bold mb-5">Send Followers</h1>
                    <div className="mb-5">
                        <label
                            htmlFor="url"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            username
                        </label>
                        <input
                            type="text"
                            id="url"
                            onChange={(e) => setUrl(e.target.value)}
                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                            placeholder="username"

                        />
                    </div>


                    <button
                        onClick={handleSubmit}
                        type="submit"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                       Send Followers
                    </button>
                </div>

            </Sidebar>
        </>
    )
}

export default Page