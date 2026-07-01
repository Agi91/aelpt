'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendPasswordReset } from '@/lib/firebase/auth';
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
import { Loader2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setSubmitting(true);
    try {
      await sendPasswordReset(data.email);
      toast.success('Password reset link sent to your email!');
      setEmailSent(true);
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : 'Failed to send reset email';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 text-zinc-100 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white text-center">
          Reset Password
        </CardTitle>
        <CardDescription className="text-zinc-400 text-center">
          Receive a link to secure your account credentials
        </CardDescription>
      </CardHeader>
      {emailSent ? (
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-zinc-300">
            We have sent a password recovery link to your inbox. Check your
            folders and follow the instructions to reset your password.
          </p>
          <Button
            type="button"
            onClick={() => setEmailSent(false)}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition"
          >
            Send Link Again
          </Button>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
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

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold transition mt-2"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Send Recovery Link
            </Button>
          </CardContent>
        </form>
      )}
      <CardFooter className="justify-center border-t border-zinc-800/50 py-4">
        <Link
          href="/login"
          className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition"
        >
          Return to Login
        </Link>
      </CardFooter>
    </Card>
  );
}
