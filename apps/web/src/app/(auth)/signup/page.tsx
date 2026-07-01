'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@aelpt/shared';
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

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupInput) => {
    setSubmitting(true);
    try {
      await signUp(data);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : 'Failed to register account';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 text-zinc-100 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white text-center">
          Create Account
        </CardTitle>
        <CardDescription className="text-zinc-400 text-center">
          Start tracking your academic progress today
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Alex Johnson"
              {...register('fullName')}
              className="border-zinc-700 bg-zinc-950 text-white placeholder-zinc-500 focus-visible:ring-purple-500"
            />
            {errors.fullName !== undefined && (
              <p className="text-xs text-red-500 font-medium">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="alex@university.edu"
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
            <Label htmlFor="password">Password</Label>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="border-zinc-700 bg-zinc-950 text-white placeholder-zinc-500 focus-visible:ring-purple-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword !== undefined && (
              <p className="text-xs text-red-500 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold transition mt-2"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Sign Up
          </Button>
        </CardContent>
      </form>
      <CardFooter className="justify-center border-t border-zinc-800/50 py-4">
        <p className="text-sm text-zinc-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-purple-400 hover:text-purple-300 transition"
          >
            Log In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
