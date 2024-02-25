"use client";
import Sidebar from "@/components/Sidebar";
import SERVER_URL from "@/utils/SERVER_URL";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function AllUser() {
  const [users, setUsers] = useState<{ _id: string }[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [search, setSearch] = useState("");
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login")
    } else {
      axios.get(SERVER_URL + "/admin/users?page=1&perPage=10", {
        headers: {
          'x-access-token': token
        }
      }).then((res) => {
        setUsers(res.data.data)
        setPage(res.data.currentPage);
        setTotalPage(res.data.totalPages);
      }).catch((err) => {
        console.log(err)
      })
    }
  }, [router]);
  const handleSearch = () => {
    const token = localStorage.getItem("token");
    if (page > 0 && page <= totalPage) {

      axios.get(SERVER_URL + "/admin/users?page=1&perPage=10&search=" + search, {
        headers: {
          'x-access-token': token
        }
      }).then((res) => {
        setUsers(res.data.data)
        setPage(res.data.currentPage);
        setTotalPage(res.data.totalPages);
        setSearch("")
      }).catch((err) => {
        console.log(err)
      })
    }

  }
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(SERVER_URL + "/admin/users?page=" + page + "&perPage=10", {
      headers: {
        'x-access-token': token
      }
    }).then((res) => {
      setUsers(res.data.data)

      setPage(res.data.currentPage);
      setTotalPage(res.data.totalPages);
      if (res.data.data.length === 0) {
        setPage(page - 1)
      }
    }).catch((err) => {
      console.log(err)
    })
  }, [page]);
  const handleDelete = (id: string) => {
    const token = localStorage.getItem("token");
    axios.delete(SERVER_URL + "/admin/delete-user/" + id, {
      headers: {
        'x-access-token': token
      }
    }).then((res) => {

        setUsers(users.filter((user) => user._id !== id));
    }).catch((err) => {
      console.log(err)

      
    })
  }
  return (
    <>
      <Sidebar>
        <div>
          <label
            htmlFor="default-search"
            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          >
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search User"
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold my-5">All User</h1>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Username
                </th>
                <th scope="col" className="px-6 py-3">
                  Password
                </th>
                <th scope="col" className="px-6 py-3">
                  Edit
                </th>
                <th scope="col" className="px-6 py-3">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {
                users.map((user: any) => (
                  <>
                    <tr>
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {user.username}
                      </th>
                      <td className="px-6 py-4">{user.password}</td>
                     
                      <td className="px-6 py-4">
                        <a
                          href="#"
                          className="font-medium text-cyan-500 dark:text-cyan-400 hover:underline"
                          onClick={() =>router.push(`/edit-user/${user._id}`)}
                        >
                          Edit
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href="#"
                          className="font-medium text-red-500 dark:text-red-400 hover:underline"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </a>
                      </td>
                    </tr>
                  </>
                ))
              }

            </tbody>
          </table>
          <div>

          </div>
        </div>

        <div className="flex flex-col items-center mt-5">
          {/* Help text */}
          <span className="text-sm text-gray-700 dark:text-gray-400">
            Page{" "}

            <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{totalPage}</span>{" "}
            Total Page
          </span>
          <div className="inline-flex mt-2 xs:mt-0">
            {/* Buttons */}
            <button onClick={() => (
              page > 1 ? setPage(page - 1) : setPage(1)
            )} className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
              <svg
                className="w-3.5 h-3.5 me-2 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5H1m0 0 4 4M1 5l4-4"
                />
              </svg>
              Prev
            </button>
            <button className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" onClick={() => setPage(page + 1)}>
              Next
              <svg
                className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </button>
          </div>
        </div>
      </Sidebar>
    </>
  )
}

export default AllUser;