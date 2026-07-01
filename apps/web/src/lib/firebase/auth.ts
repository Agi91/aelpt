import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  type UserCredential,
} from 'firebase/auth';
import { auth } from './config';
import type { LoginInput, SignupInput } from '@aelpt/shared';

export const signInWithEmail = async (
  input: LoginInput
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, input.email, input.password);
};

export const signUpWithEmail = async (
  input: SignupInput
): Promise<UserCredential> => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    input.email,
    input.password
  );
  if (credential.user !== null) {
    await updateProfile(credential.user, {
      displayName: input.fullName,
    });
  }
  return credential;
};

export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signOutUser = async (): Promise<void> => {
  return signOut(auth);
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};
