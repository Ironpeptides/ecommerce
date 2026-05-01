"use client";

import { Loader2, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { LoginProps } from "@/types/types";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import { FaGoogle } from "react-icons/fa";
import TextInput from "../FormInputs/TextInput";
import PasswordInput from "../FormInputs/PasswordInput";
import SubmitButton from "../FormInputs/SubmitButton";
import Logo from "../global/Logo";
import CustomCarousel from "../frontend/custom-carousel";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [passErr, setPassErr] = useState("");
  const router = useRouter();
  const params = useSearchParams();

  // Support both ?returnUrl= (existing links) and ?redirect= (modal)
  const redirectTo =
    params.get("redirect") ||
    params.get("returnUrl") ||
    params.get("callbackUrl") ||
    "/dashboard";

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<LoginProps>();

  async function onSubmit(data: LoginProps) {
    try {
      setLoading(true);
      setPassErr("");

      const result = await signIn("credentials", {
        ...data,
        redirect: false, // handle redirect manually so we control destination
      });

      if (result?.error) {
        setLoading(false);
        toast.error("Sign-in failed", {
          description: "Check your credentials or verify your email.",
        });
        setPassErr("Wrong credentials or unverified account — check and try again.");
      } else {
        reset();
        toast.success("Welcome back!");
        router.push(redirectTo); // lands on /dashboard/billing if that's where they came from
      }
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full lg:grid min-h-screen lg:grid-cols-2 relative">

      {/* ── Left — form ── */}
      <div className="flex items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-[400px] space-y-7">

          {/* Logo */}
          <div className="flex justify-center lg:justify-start">
            <Logo />
          </div>

          {/* Heading */}
          <div className="space-y-1 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-muted-foreground text-sm">
              Welcome back to{" "}
              <span className="text-blue-600 font-medium">HÆLO Peptides</span>
            </p>
          </div>

          {/* Credentials form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              register={register}
              errors={errors}
              label="Email Address"
              name="email"
              icon={Mail}
              placeholder="you@example.com"
            />
            <PasswordInput
              register={register}
              errors={errors}
              label="Password"
              name="password"
              icon={Lock}
              placeholder="••••••••"
              forgotPasswordLink="/forgot-password"
            />
            {passErr && (
              <p className="text-red-500 text-xs leading-relaxed">{passErr}</p>
            )}
            <SubmitButton
              title="Sign In"
              loadingTitle="Signing in..."
              loading={loading}
              className="w-full"
              loaderIcon={Loader2}
              showIcon={false}
            />
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span className="uppercase text-xs tracking-widest">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google OAuth — passes redirectTo as callbackUrl so NextAuth
              restores the destination after the OAuth round-trip           */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => signIn("google", { callbackUrl: redirectTo })}
          >
            <FaGoogle className="h-4 w-4 text-red-500" />
            Continue with Google
          </Button>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right — carousel (hidden on mobile) ── */}
      <div className="hidden lg:block relative bg-muted">
        <CustomCarousel />
      </div>
    </div>
  );
}