import {create} from "zustand";
import {persist} from "zustand/middleware";
//import { sendKafkaEvent } from "../../actions/track-user";

type Product = {
    id:string;
    title: string;
    price: number;
    image:string;
    quantity?:number;
    shopId: string;
    organizationId: string;
}

type Store = {
    cart: Product[];
    wishlist: Product[];
    addToCart: (
        product: Product,
        user:any,
        location:any,
        deviceInfo:any,
    )=> void;
    removeFromCart: (
        id:string,
        user:any,
        location: any,
        deviceInfo: any,

    )=> void;
    addToWishList: (
        product: Product,
        user:any,
        location:any,
        deviceInfo:any,

    )=>void;
    removeFromWishList: (
        id: string,
        user:any,
        location:any,
        deviceInfo: any
    )=>void;
}

export const useStore = create<Store>()(
    persist(
        (set,get)=>({
            cart: [],
            wishlist:[],

            // Add to cart

            addToCart: (product, user,location, deviceInfo)=>{
                
                set((state)=>{
                    const  existing = state.cart?.find((item)=>item.id === product.id)
                    if(existing){
                        return {
                            cart: state.cart.map((item)=> item.id === product.id ? {...item, quantity: (item.quantity ?? 1) + 1}: item)
                        }
                    }
                    return {cart:[...state.cart, {...product, quantity: product?.quantity}] }
                });

                // send kafka event

                
                if(user?.id && location && deviceInfo){

                    const {country, city } = location.location || {};
                    /* sendKafkaEvent({
                        userId: user?.id,
                        organizationId: user?.organizations?.[0]?.id,
                        productId: product?.id,
                        shopId: product?.shopId,
                        action: "add_to_cart",
                        country: country || "Unkonwn",
                        city:city || "Unkonwn",
                        device: deviceInfo || "Unkown Device"

                    })
 */
                }


            },

            // remove from cart

            removeFromCart: (id, user,location, deviceInfo)=>{
               // find the product before calling set
               

               const removeProduct = get().cart.find((item)=> item.id === id);

               set((state)=>({
                cart: state.cart?.filter((item)=> item.id !== id) 
               }));

               // send kafka event

                if(user?.id && location && deviceInfo && removeProduct){
                    const {country, city } = location.location || {};
                    /* sendKafkaEvent({
                        userId: user?.id,
                        productId: removeProduct?.id,
                        organizationId: user.organizations?.[0]?.id,
                        shopId: removeProduct?.shopId,
                        action: "remove_from_cart",
                        country: country || "Unkonwn",
                        city: city || "Unkonwn",
                        device: deviceInfo || "Unkown Device"

                    }) */

                }
            },

            // Add to wishlist

            addToWishList: (product, user,location, deviceInfo)=>{
                set((state)=>{
                    if(state.wishlist.find((item)=> item.id === product.id))
                        return state;
                    return {wishlist: [...state.wishlist, product]};

                });

                // send kafka event
                const organizationId = user?.organizations?.[0]?.id;
                

                if(user?.id && location && deviceInfo){
                    const {country, city } = location.location || {};
                    /* sendKafkaEvent({
                        userId: user?.id,
                        productId: product?.id,
                        organizationId: user.organizations?.[0]?.id,
                        shopId: product?.shopId,
                        action: "add_to_wishlist",
                        country: country || "Unkonwn",
                        city: city || "Unkonwn",
                        device: deviceInfo || "Unkown Device"

                    }) */

                } else {
        console.warn("Missing required data for Kafka event:", {
            hasUserId: !!user?.id,
            hasOrgId: !!organizationId,
            hasLocation: !!location,
            hasDeviceInfo: !!deviceInfo,
             
        })}


            },
            removeFromWishList: (id,user, location, deviceInfo )=>{
                // Find the product BEFORE calling `set`

                const removeProduct = get().wishlist.find((item)=> item.id === id);

                set((state)=>({
                    wishlist: state.wishlist.filter((item)=> item.id !== id)
                }));


                               // send kafka event
                    const organizationId = user?.organizations?.[0]?.id;
                    

                if(user?.id  && location && deviceInfo && removeProduct){
                    const {country, city } = location.location || {};
                    /* sendKafkaEvent({
                        userId: user?.id,
                        productId: removeProduct?.id,
                        organizationId: user.organizations?.[0]?.id,
                        shopId: removeProduct?.shopId,
                        action: "remove_from_wishlist",
                        country: country || "Unkonwn",
                        city: city || "Unkonwn",
                        device: deviceInfo || "Unkown Device"

                    }) */

                } else {
        console.warn("Missing required data for Kafka event:", {
            hasUserId: !!user?.id,
            hasOrgId: !!organizationId,
            hasLocation: !!location,
            hasDeviceInfo: !!deviceInfo,
            user
        })}


            }

        }),
        {name: "store-storage"}
    )
)