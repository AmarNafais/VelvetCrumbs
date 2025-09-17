import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import app from "./server";

// Initialize Firebase Admin
admin.initializeApp();

// Export the Express app as a Firebase function
export const api = functions.https.onRequest(app);