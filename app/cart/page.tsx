"use client";

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import useUser from '../../hooks/useUser';
import useLocationTracking from '../../hooks/useLocationTracking';
import useDeviceTracking from '../../hooks/useDeviceTracking';
import Link from 'next/link';
import { useStore } from '../../store';
import Image from 'next/image';
import { Loader2, Trash2, ShoppingBag, Heart, ArrowRight, CreditCard, Truck, Tag, X, Shield, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
// import { useQuery } from '@tanstack/react-query';
// import axiosInstance from '../../utils/axiosinstance';
import toast from 'react-hot-toast';

const CartPage = () => {
    const router = useRouter();
    const {user} = useUser();
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();
    const cart = useStore((state:any)=>state.cart);
    const removeFromCart = useStore((state:any)=>state.removeFromCart);
    const [loading, setLoading] = useState(false);
    const [discountedProductId, setDiscountedProductId] = useState(" ");
    const [discountPercent, setDiscountPercent] = useState(0);
    const addToCart = useStore((state:any)=>state.addToCart);
    const removeFromWishlist = useStore((state:any)=>state.removeFromWishList);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponCode, setCouponCode] = useState("");
    const [selectedAddressId, setSelectedAddressId]= useState("");
    const [couponError, setCouponError] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("online");

    // Compliance checkboxes
    const [agreedAge, setAgreedAge] = useState(false);
    const [agreedNotHuman, setAgreedNotHuman] = useState(false);
    const bothAgreed = agreedAge && agreedNotHuman;

    // Static addresses data (commented out API call)
    const addresses = [
        {
            id: "addr_1",
            label: "Home",
            city: "New York",
            country: "USA",
            address: "123 Main St",
            zipCode: "10001",
            isDefault: true
        },
        {
            id: "addr_2",
            label: "Office",
            city: "Los Angeles",
            country: "USA",
            address: "456 Business Ave",
            zipCode: "90001",
            isDefault: false
        },
        {
            id: "addr_3",
            label: "Weekend Home",
            city: "Miami",
            country: "USA",
            address: "789 Beach Rd",
            zipCode: "33101",
            isDefault: false
        }
    ];

    // Commented out API call for shipping addresses
    // const {data:addresses = []} = useQuery<any[], Error>({
    //     queryKey: ["shipping-addresses"],
    //     queryFn: async ()=>{
    //         const res = await axiosInstance.get("/auth/api/shipping-addresses");
    //         return res.data.addresses;
    //     }
    // });

    // Commented out API call for create payment session
    const createPaymentSession = async ()=>{
        if (!bothAgreed) {
            toast.error("Please agree to both compliance statements before proceeding.");
            return;
        }

        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Static session creation (commented out actual API call)
            // const res = await axiosInstance.post("/order/api/create-payment-session",{
            //     cart,
            //     selectedAddressId,
            //     coupon:{}
            // });
            // const sessionId = res.data.sessionId;
            // router.push(`/checkout?sessionId=${sessionId}`);

            toast.success("Order placed successfully! (Demo mode)");
            router.push(`/checkout?sessionId=demo_session_${Date.now()}`);
            
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const applyCoupon = () => {
        if (!couponCode.trim()) {
            setCouponError("Please enter a coupon code");
            return;
        }
        
        // Static coupon logic (commented out API call)
        if (couponCode.toUpperCase() === "SAVE10") {
            const discount = subtotal * 0.1;
            setDiscountAmount(discount);
            setDiscountPercent(10);
            setCouponError("");
            toast.success("Coupon applied successfully!");
        } else if (couponCode.toUpperCase() === "SAVE20") {
            const discount = subtotal * 0.2;
            setDiscountAmount(discount);
            setDiscountPercent(20);
            setCouponError("");
            toast.success("Coupon applied successfully!");
        } else {
            setCouponError("Invalid coupon code");
            setDiscountAmount(0);
            setDiscountPercent(0);
        }
    };

    const removeCoupon = () => {
        setDiscountAmount(0);
        setDiscountPercent(0);
        setCouponCode("");
        setCouponError("");
        toast.success("Coupon removed");
    };

    const decreaseQuantity = (id:string)=>{
        useStore.setState((state:any)=>({
           cart: state.cart.map((item:any)=>item.id === id && item.quantity > 1 ? {...item, quantity: item.quantity - 1}: item) 
        }));
    }

    const removeItem = (id:string)=>{
        removeFromCart(id, user, location, deviceInfo);
        toast.success("Item removed from cart");
    }

    const increaseQuantity = (id:string)=>{
        useStore.setState((state:any)=>({
            cart: state.cart.map((item:any)=> item.id === id ? {...item, quantity: (item.quantity ?? 1 ) + 1 }:item)
        }));
    };

    const subtotal = cart.reduce((total:number, item:any)=>total + item.quantity * item.sale_price, 0);
    const total = subtotal - discountAmount;

    useEffect(()=>{
        if(addresses.length > 0 && !selectedAddressId){
            const defaultAddr = addresses.find((addr)=> addr.isDefault);
            if(defaultAddr){
                setSelectedAddressId(defaultAddr.id)
            }
        }
    }, [addresses, selectedAddressId]);

    const canCheckout = bothAgreed && addresses.length > 0 && !loading;

    return (
        <div className='min-h-screen bg-gradient-to-b from-[#121214] to-[#0a0a0c]'>
            <div className='md:w-[85%] w-[95%] mx-auto py-8'>
                {/* Breadcrumb */}
                <div className='mb-8'>
                    <h1 className='text-3xl md:text-4xl font-bold text-white mb-4 font-jost'>
                        Shopping Cart
                    </h1>
                    <div className='flex items-center gap-2 text-sm'>
                        <Link href="/" className='text-gray-400 hover:text-emerald-400 transition-colors'>
                            Home
                        </Link>
                        <span className='text-gray-600'>/</span>
                        <span className='text-gray-300'>Cart</span>
                    </div>
                </div>

                {cart.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10'>
                        <div className='w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4'>
                            <ShoppingBag size={40} className='text-gray-600' />
                        </div>
                        <p className='text-gray-300 text-xl font-semibold mb-2'>Your cart is empty</p>
                        <p className='text-gray-500 text-sm mb-6'>Add some products to get started.</p>
                        <Link 
                            href="/" 
                            className='px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all duration-200 flex items-center gap-2 font-medium'
                        >
                            Browse Products
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className='lg:flex items-start gap-8'>
                        {/* Cart Items Table */}
                        <div className='w-full lg:w-[65%]'>
                            <div className='bg-[#121214] border border-white/10 rounded-xl overflow-hidden'>
                                <div className='hidden md:grid grid-cols-12 gap-4 p-4 bg-white/5 border-b border-white/10 text-gray-400 text-xs font-semibold uppercase tracking-widest'>
                                    <div className='col-span-5'>Product</div>
                                    <div className='col-span-2 text-center'>Price</div>
                                    <div className='col-span-3 text-center'>Quantity</div>
                                    <div className='col-span-2 text-center'>Remove</div>
                                </div>
                                
                                <div className='divide-y divide-white/10'>
                                    {cart?.map((item:any) => (
                                        <div key={item.id} className='p-4 hover:bg-white/[0.03] transition-colors duration-200 group'>
                                            <div className='flex flex-col md:grid md:grid-cols-12 gap-4 items-center'>
                                                {/* Product Info */}
                                                <div className='flex gap-4 md:col-span-5 w-full'>
                                                    <div className='relative w-20 h-20 bg-black/30 rounded-xl overflow-hidden flex-shrink-0 border border-white/10'>
                                                        <Image
                                                            src={item?.images[0]?.url || '/placeholder.jpg'}
                                                            alt={item.title}
                                                            fill
                                                            className='object-cover'
                                                        />
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <h3 className='font-medium text-white line-clamp-2 mb-1 text-sm'>
                                                            {item.title}
                                                        </h3>
                                                        {item?.selectedOption && (
                                                            <span className='inline-flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider'>
                                                                {item.selectedOption.label}
                                                            </span>
                                                        )}
                                                        {item?.selectedOptions && (
                                                            <div className='text-xs text-gray-400 space-y-1 mt-1'>
                                                                {item?.selectedOptions?.color && (
                                                                    <div className='flex items-center gap-1'>
                                                                        <span>Color:</span>
                                                                        <span 
                                                                            style={{backgroundColor: item?.selectedOptions?.color}}
                                                                            className='w-3 h-3 rounded-full inline-block border border-white/20'
                                                                        />
                                                                    </div>
                                                                )}
                                                                {item?.selectedOptions?.size && (
                                                                    <div>Size: {item?.selectedOptions?.size}</div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <p className='text-xs text-gray-500 mt-1'>{item?.shop?.name}</p>
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className='md:col-span-2 flex items-center justify-start md:justify-center'>
                                                    {item?.id === discountedProductId ? (
                                                        <div className='text-center'>
                                                            <span className='line-through text-gray-500 text-xs block'>
                                                                ${item.sale_price.toFixed(2)}
                                                            </span>
                                                            <span className='text-emerald-400 font-semibold'>
                                                                ${((item.sale_price * (100 - discountPercent)) / 100).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className='text-white font-semibold'>
                                                            ${item?.sale_price.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Quantity */}
                                                <div className='md:col-span-3 flex items-center justify-start md:justify-center'>
                                                    <div className='flex items-center border border-white/10 rounded-lg bg-white/5 overflow-hidden'>
                                                        <button
                                                            className='w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors'
                                                            onClick={() => decreaseQuantity(item.id)}
                                                        >
                                                            −
                                                        </button>
                                                        <span className='px-3 text-white min-w-[40px] text-center text-sm font-semibold'>
                                                            {item?.quantity}
                                                        </span>
                                                        <button
                                                            className='w-9 h-9 flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors'
                                                            onClick={() => increaseQuantity(item?.id)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Action */}
                                                <div className='md:col-span-2 flex items-center justify-start md:justify-center'>
                                                    <button
                                                        className='text-gray-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10'
                                                        onClick={() => removeItem(item.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Cart Footer */}
                                <div className='p-4 bg-white/[0.02] border-t border-white/10 flex justify-between items-center'>
                                    <span className='text-gray-500 text-sm'>{cart.length} item{cart.length > 1 ? 's' : ''} in cart</span>
                                    <span className='text-gray-300 text-sm font-semibold'>Subtotal: <span className='text-white'>${subtotal.toFixed(2)}</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className='w-full lg:w-[35%] mt-8 lg:mt-0'>
                            <div className='bg-[#121214] border border-white/10 rounded-xl p-6 sticky top-8 space-y-5'>
                                <h2 className='text-lg font-bold text-white pb-4 border-b border-white/10 flex items-center gap-2'>
                                    <ShoppingBag size={18} className='text-emerald-500' />
                                    Order Summary
                                </h2>

                                {/* Price Breakdown */}
                                <div className='space-y-3'>
                                    <div className='flex justify-between items-center text-gray-400 text-sm'>
                                        <span>Subtotal ({cart.length} items)</span>
                                        <span className='text-white font-medium'>${subtotal.toFixed(2)}</span>
                                    </div>

                                    {discountAmount > 0 && (
                                        <div className='flex justify-between items-center p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20'>
                                            <div className='flex items-center gap-2 text-sm'>
                                                <Tag size={13} className='text-emerald-400' />
                                                <span className='text-emerald-300 font-medium'>Discount ({discountPercent}%)</span>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-emerald-400 font-semibold text-sm'>
                                                    −${discountAmount.toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={removeCoupon}
                                                    className='text-gray-500 hover:text-red-400 transition-colors'
                                                >
                                                    <X size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className='flex justify-between items-center text-gray-400 text-sm'>
                                        <span>Shipping</span>
                                        <span className='text-gray-300 italic'>Calculated at checkout</span>
                                    </div>

                                    <div className='flex justify-between items-center pt-3 border-t border-white/10'>
                                        <span className='text-white font-bold text-lg'>Total</span>
                                        <span className='text-emerald-400 font-bold text-2xl'>${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Coupon Code */}
                                <div className='space-y-2'>
                                    <label className='block text-xs font-semibold text-gray-400 uppercase tracking-widest'>
                                        Coupon Code
                                    </label>
                                    <div className='flex gap-2'>
                                        <input 
                                            type="text" 
                                            value={couponCode} 
                                            onChange={(e:any) => {
                                                setCouponCode(e.target.value);
                                                setCouponError("");
                                            }}
                                            placeholder='e.g. SAVE10'
                                            className='flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 transition-colors'
                                        />
                                        <button
                                            className='px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all duration-200 text-sm font-semibold'
                                            onClick={applyCoupon}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {couponError && (
                                        <p className='text-xs text-red-400 flex items-center gap-1'>
                                            <X size={11} /> {couponError}
                                        </p>
                                    )}
                                    <p className='text-[11px] text-gray-600'>Try: SAVE10 (10% off) or SAVE20 (20% off)</p>
                                </div>

                                {/* Shipping Address */}
                                <div className='space-y-2'>
                                    <label className='block text-xs font-semibold text-gray-400 uppercase tracking-widest'>
                                        Shipping Address
                                    </label>
                                    {addresses?.length !== 0 ? (
                                        <select 
                                            className='w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/60 transition-colors cursor-pointer'
                                            value={selectedAddressId}
                                            onChange={(e)=>setSelectedAddressId(e.target.value)}
                                        >
                                            {addresses?.map((address:any) => (
                                                <option key={address.id} value={address.id} className='bg-[#121214]'>
                                                    {address.label} — {address.city}, {address.country}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className='p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg'>
                                            <p className='text-sm text-yellow-400'>
                                                Please add an address from your profile to place an order.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Method */}
                                <div className='space-y-2'>
                                    <label className='block text-xs font-semibold text-gray-400 uppercase tracking-widest'>
                                        Payment Method
                                    </label>
                                    <div className='space-y-2'>
                                        <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="online"
                                                checked={paymentMethod === "online"}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className='accent-emerald-500'
                                            />
                                            <CreditCard size={16} className={paymentMethod === 'online' ? 'text-emerald-400' : 'text-gray-400'} />
                                            <span className={`text-sm font-medium ${paymentMethod === 'online' ? 'text-emerald-300' : 'text-gray-300'}`}>Online Payment</span>
                                        </label>
                                        <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="cod"
                                                checked={paymentMethod === "cod"}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className='accent-emerald-500'
                                            />
                                            <Truck size={16} className={paymentMethod === 'cod' ? 'text-emerald-400' : 'text-gray-400'} />
                                            <span className={`text-sm font-medium ${paymentMethod === 'cod' ? 'text-emerald-300' : 'text-gray-300'}`}>Cash on Delivery</span>
                                        </label>
                                    </div>
                                </div>

                                {/* ─── Compliance Checkboxes ─────────────────────────── */}
                                <div className='space-y-3 pt-1'>
                                    <div className='flex items-start gap-1 pb-2 border-b border-white/10'>
                                        <Shield size={13} className='text-amber-400 mt-0.5 shrink-0' />
                                        <p className='text-[11px] font-semibold text-amber-400 uppercase tracking-widest'>
                                            Compliance required
                                        </p>
                                    </div>

                                    {/* Age check */}
                                    <button
                                        onClick={() => setAgreedAge(!agreedAge)}
                                        className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                                            agreedAge
                                                ? 'bg-emerald-500/10 border-emerald-500/40'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className='mt-0.5 shrink-0'>
                                            {agreedAge
                                                ? <CheckCircle2 size={17} className='text-emerald-400' />
                                                : <Circle size={17} className='text-gray-500' />
                                            }
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold leading-snug ${agreedAge ? 'text-emerald-300' : 'text-gray-300'}`}>
                                                I confirm I am 18 years or older
                                            </p>
                                            <p className='text-[11px] text-gray-500 mt-0.5 leading-relaxed'>
                                                By checking this, you declare that you meet the minimum age requirement to purchase this product.
                                            </p>
                                        </div>
                                    </button>

                                    {/* Not for human consumption check */}
                                    <button
                                        onClick={() => setAgreedNotHuman(!agreedNotHuman)}
                                        className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                                            agreedNotHuman
                                                ? 'bg-emerald-500/10 border-emerald-500/40'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className='mt-0.5 shrink-0'>
                                            {agreedNotHuman
                                                ? <CheckCircle2 size={17} className='text-emerald-400' />
                                                : <Circle size={17} className='text-gray-500' />
                                            }
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold leading-snug ${agreedNotHuman ? 'text-emerald-300' : 'text-gray-300'}`}>
                                                I understand this is not for human consumption
                                            </p>
                                            <p className='text-[11px] text-gray-500 mt-0.5 leading-relaxed'>
                                                This product is intended for research purposes only and must not be ingested or used on humans.
                                            </p>
                                        </div>
                                    </button>

                                    {/* Warning banner when not agreed */}
                                    {!bothAgreed && (
                                        <div className='flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl'>
                                            <AlertTriangle size={14} className='text-amber-400 shrink-0 mt-0.5' />
                                            <p className='text-[11px] text-amber-400 leading-relaxed'>
                                                You must acknowledge both statements above before you can proceed to checkout.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {/* ─────────────────────────────────────────────────── */}

                                {/* Checkout Button */}
                                <button
                                    onClick={createPaymentSession}
                                    disabled={!canCheckout}
                                    className={`w-full flex items-center justify-center gap-2 py-3.5 font-semibold rounded-xl transition-all duration-300 ${
                                        canCheckout
                                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-900/20 active:scale-[0.98]'
                                            : 'bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed'
                                    }`}
                                >
                                    {loading
                                        ? <><Loader2 className='animate-spin w-4 h-4' /> Processing...</>
                                        : <><Shield size={16} /> Proceed to Checkout</>
                                    }
                                </button>

                                {/* Continue Shopping Link */}
                                <Link 
                                    href="/"
                                    className='flex items-center justify-center gap-2 text-gray-500 hover:text-emerald-400 transition-colors text-sm'
                                >
                                    Continue Shopping
                                    <ArrowRight size={13} />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CartPage;