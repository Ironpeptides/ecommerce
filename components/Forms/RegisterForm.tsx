"use client";
import { Headset, Loader2, Lock, Mail, User, Warehouse } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { UserProps } from "@/types/types";
import {toast} from "sonner";
import { useRouter } from "next/navigation";
import TextInput from "../FormInputs/TextInput";
import PasswordInput from "../FormInputs/PasswordInput";
import SubmitButton from "../FormInputs/SubmitButton";
import { createUser } from "@/actions/users";
import CustomCarousel from "../frontend/custom-carousel";

import { signIn } from "next-auth/react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import Logo from "../global/Logo";
import FormSelectInput from "../FormInputs/FormSelectInput";
import countries from "@/utils/countries";
import { generateSlug } from "@/lib/generateSlug";

export type OrgData = {
  name: string;
  slug: string;
  timezone: string | undefined;
  currency: string | undefined;
  country: string;
};

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const initialCountryCode = "MX";
  const initialCountry = countries.find(
    (item) => item.code === initialCountryCode
  );
  const [selectedCountry, setSelectedCountry] = useState<any>(initialCountry);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<UserProps>();
  const router = useRouter();

  async function onSubmit(data: UserProps) {
    setLoading(true);
    data.name = `${data.firstName} ${data.lastName}`;
    data.role = "buyer";
    data.image =
      "https://utfs.io/f/59b606d1-9148-4f50-ae1c-e9d02322e834-2558r.png";

    const country = countries.find(
      (country) => country.value === selectedCountry?.value
    );

    const orgData: OrgData = {
      name: data.orgName,
      slug: generateSlug(data.orgName),
      timezone: country?.timezone,
      currency: country?.value,
      country: `${country?.label}-${country?.code}`,
    };

    try {
      const res = await createUser(data, orgData);
      if (res.status === 409) {
        setLoading(false);
        setEmailErr(res.error);
      } else if (res.status === 200) {
        setLoading(false);
        toast.success("Account Created successfully",{
          description:"Your account has been created, pending verification"
        });
        router.push(`/verify/${res.data?.id}?email=${res.data?.email}`);
      } else {
        setLoading(false);
        toast.error("Something went wrong");
      }
    } catch (error) {
      setLoading(false);
      console.error("Network Error:", error);
      toast.error("It seems something is wrong, try again");
    }
  }

  return (
    <div className="w-full lg:grid min-h-screen lg:grid-cols-2 relative  text-white">
      
      {/* ── Left: Form Panel ── */}
      <div className="flex items-center justify-center py-16 px-6 relative">
        
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/5 blur-[100px]" />

        <div className="relative w-full max-w-md space-y-8">
          
          {/* Logo */}
          <div className="flex justify-center lg:justify-start">
            <Logo />
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Create an account
            </h1>
            <p className="text-zinc-400 text-sm">
              Join{" "}
              <span className="text-emerald-400 font-medium">Haelolabs</span>{" "}
              to get started today.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Org + Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
              <TextInput
                register={register}
                errors={errors}
                label="Organisation (optional)"
                name="orgName"
                icon={Warehouse}
                placeholder="e.g. PeptidesInc"
                
              />
              <FormSelectInput
                label="Country"
                options={countries}
                option={selectedCountry}
                setOption={setSelectedCountry}
              />
            </div>

            {/* First + Last name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                register={register}
                errors={errors}
                label="First Name"
                name="firstName"
                icon={User}
                placeholder="First name"
              />
              <TextInput
                register={register}
                errors={errors}
                label="Last Name"
                name="lastName"
                icon={User}
                placeholder="Last name"
              />
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                register={register}
                errors={errors}
                label="Phone"
                name="phone"
                icon={Headset}
                placeholder="+1 234 567 890"
              />
              <TextInput
                type="email"
                register={register}
                errors={errors}
                label="Email Address"
                name="email"
                icon={Mail}
                placeholder="you@example.com"
                isRequired={false}
              />
            </div>

            {/* Password */}
            <PasswordInput
              register={register}
              errors={errors}
              label="Password"
              name="password"
              icon={Lock}
              placeholder="Create a strong password"
              type="password"
            />

            {/* Email conflict error */}
            {emailErr && (
              <p className="text-red-400 text-xs">{emailErr}</p>
            )}

            <SubmitButton
              title="Create Account"
              loadingTitle="Creating account…"
              loading={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold transition-colors"
              loaderIcon={Loader2}
              showIcon={false}
            />
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-zinc-500 uppercase tracking-widest">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors"
            >
              <FaGoogle className="w-4 h-4 text-red-400" />
              Continue with Google
            </button>
            <button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors"
            >
              <FaGithub className="w-4 h-4 text-zinc-300" />
              Continue with GitHub
            </button>
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right: Carousel Panel ── */}
      <div
        className="hidden lg:flex items-center justify-center relative border-l border-white/5"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        }}
      >
        {/* Corner accent matching homepage style */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-[80px]" />
        <CustomCarousel />
      </div>
    </div>
  );
}