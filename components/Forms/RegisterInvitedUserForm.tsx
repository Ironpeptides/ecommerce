"use client";
import { Headset, Loader2, Lock, Mail, User, Warehouse } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { InvitedUserProps, UserProps } from "@/types/types";
import {toast} from "sonner";
import { useRouter } from "next/navigation";
import TextInput from "../FormInputs/TextInput";
import PasswordInput from "../FormInputs/PasswordInput";
import SubmitButton from "../FormInputs/SubmitButton";
import { createInvitedUser, createUser } from "@/actions/users";
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

export default function RegisterInvitedUserForm({ userEmail, orgId, orgName, roleId }: { userEmail: string; orgId: string; orgName: string; roleId: string }) {
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<InvitedUserProps>({
    defaultValues: {
      email: userEmail,
    },

  });
  const router = useRouter();

  async function onSubmit(data: InvitedUserProps) {
    setLoading(true);
    data.orgId = orgId;
    data.roleId = roleId;
    data.name = `${data.firstName} ${data.lastName}`;
    data.orgName = orgName;
    data.role = "buyer";
    data.image =
      "https://utfs.io/f/59b606d1-9148-4f50-ae1c-e9d02322e834-2558r.png";

    
    try {
      const res = await createInvitedUser(data);
      if (res.status === 409) {
        setLoading(false);
        setEmailErr(res.error);
      } else if (res.status === 200) {
        setLoading(false);
        toast.success("Account Created successfully",{
          description:"Your account has been created successfully, Please login"
        });
        router.push(`/login`);
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
              Welcome to  Haelolabs Team {/* {orgName} */}
            </h1>
            <p className="text-zinc-400 text-sm">
              Please{" "}
              <span className="text-emerald-400 font-medium">customize your account</span>{" "}
              to get started.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

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