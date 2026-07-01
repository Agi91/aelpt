import { db } from '../firebase/firestore';
import { COLLECTIONS } from '../lib/constants/collections';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  createdAt: string;
  onboardingDone: boolean;
  role: 'student' | 'admin';
}

export class UserService {
  public static async createUserProfile(
    uid: string,
    data: { fullName: string; email: string }
  ): Promise<UserProfile> {
    const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
    const doc = await userRef.get();

    if (doc.exists) {
      return doc.data() as UserProfile;
    }

    const newUserProfile: UserProfile = {
      uid,
      fullName: data.fullName,
      email: data.email,
      createdAt: new Date().toISOString(),
      onboardingDone: false,
      role: 'student', // default role
    };

    await userRef.set(newUserProfile);
    return newUserProfile;
  }

  public static async getUserProfile(uid: string): Promise<UserProfile | null> {
    const doc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as UserProfile;
  }

  public static async updateUserProfile(
    uid: string,
    data: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>
  ): Promise<UserProfile> {
    const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
    await userRef.update(data);
    const updated = await userRef.get();
    return updated.data() as UserProfile;
  }
}
