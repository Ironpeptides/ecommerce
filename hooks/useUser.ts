// import {useQuery} from "@tanstack/react-query";
// import axiosInstance from "../utils/axiosinstance";

import { useSession } from "next-auth/react";


// --- Static User Data ---
const staticUser = {
    id: 1,
    name: "John Doe",
    email: "johndoe@example.com",
    avatar: "/images/avatar.jpg",
    role: "customer",
    createdAt: "2024-01-15T00:00:00.000Z",
};
// --- End Static User Data ---

// const fetchUser = async ()=>{
//     const response = await axiosInstance.get("/auth/api/logged-in-user");
//     return response.data.user;
// };

const useUser = ()=>{
    // const {
    //     data: user,
    //     isLoading,
    //     isError,
    //     refetch} = useQuery({
    //     queryKey: ["user"],
    //     queryFn: fetchUser,
    //     staleTime: 1000 * 60 * 5,
    //     retry: 1,
    // });

    const { data: session } = useSession();

    const user = session?.user;
    const isLoading = false;
    const isError = false;
    const refetch = () => {};

    return {user, isLoading, isError, refetch};
}

export default useUser;