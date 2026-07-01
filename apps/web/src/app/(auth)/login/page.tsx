'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@aelpt/shared';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setSubmitting(true);
    try {
      await signIn(data);
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : 'Invalid credentials';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
      toast.success('Logged in with Google successfully!');
      router.push('/dashboard');
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : 'Google sign-in failed';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 text-zinc-100 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white text-center">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-zinc-400 text-center">
          Sign in to your learning dashboard
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@university.edu"
              {...register('email')}
              className="border-zinc-700 bg-zinc-950 text-white placeholder-zinc-500 focus-visible:ring-purple-500"
            />
            {errors.email !== undefined && (
              <p className="text-xs text-red-500 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="border-zinc-700 bg-zinc-950 text-white placeholder-zinc-500 focus-visible:ring-purple-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password !== undefined && (
              <p className="text-xs text-red-500 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Sign In
          </Button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-zinc-500 text-xs uppercase tracking-wider font-semibold">
              Or continue with
            </span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 font-medium transition"
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Sign in with Google
          </Button>
        </CardContent>
      </form>
      <CardFooter className="justify-center border-t border-zinc-800/50 py-4">
        <p className="text-sm text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold text-purple-400 hover:text-purple-300 transition"
          >
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
