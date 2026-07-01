import { adminApp } from './admin';

export const db = adminApp.firestore();
// Configure firestore settings if needed (e.g. ignoreUndefinedProperties)
db.settings({ ignoreUndefinedProperties: true });
