// V2 SDK IMPORTS - CORRECTED
const { onCall, HttpsError, onRequest } = require("firebase-functions/v2/https");
const { onUserCreated } = require("firebase-functions/v2/identity");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const stripe = require("stripe");

admin.initializeApp();

// This webhook securely accesses secrets from Secret Manager.
exports.stripewebhook = onRequest({ secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] }, async (request, response) => {
    const signature = request.headers["stripe-signature"];
    let event;
    try {
        const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
        event = stripeClient.webhooks.constructEvent(request.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        logger.error("Webhook signature verification failed.", err);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const customerEmail = session.customer_details.email;
        if (!customerEmail) {
            logger.error("No customer email found in Stripe session.");
            return response.status(400).send("Bad Request: Missing customer email.");
        }

        try {
            const userRecord = await admin.auth().getUserByEmail(customerEmail);
            const firebaseUID = userRecord.uid;

            const userDocRef = admin.firestore().collection("users").doc(firebaseUID);
            await userDocRef.update({
                subscriptionStatus: "active",
                stripeCustomerId: session.customer,
            });
            logger.info(`Successfully granted Pro access to user: ${firebaseUID}`);
        } catch (err) {
            logger.error(`Failed to grant Pro access for email ${customerEmail}:`, err);
            return response.status(500).send("Internal Server Error");
        }
    }
    response.status(200).send();
});

// This function is triggered by Firebase Auth when a new user is created.
exports.onusercreate = onUserCreated(async (event) => {
    const user = event.data;
    const { uid, email, displayName } = user; // Added displayName
    logger.info(`New user signed up: ${uid}, Email: ${email}`);
    try {
        const userDocRef = admin.firestore().collection("users").doc(uid);
        await userDocRef.set({
            email: email,
            displayName: displayName || null, // Add displayName, handle if it's not present
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            subscriptionStatus: "inactive",
        });
        logger.info(`Successfully created user document for new user: ${uid}`);
    } catch (error) {
        logger.error(`Failed to create documents for user: ${uid}`, error);
    }
});

// This is a callable function to create a share invitation.
exports.createShareInvite = onCall(async (request) => {
  // Ensure the user is logged in
  if (!request.auth) {
    throw new HttpsError( // CORRECTED
      "unauthenticated",
      "You must be logged in to share a list.",
    );
  }

  const { listId, recipientEmail } = request.data;

  // Validate the data received from the front-end
  if (!listId || !recipientEmail) {
    throw new HttpsError( // CORRECTED
      "invalid-argument",
      "The function must be called with a 'listId' and 'recipientEmail'.",
    );
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    throw new HttpsError( // CORRECTED
      "invalid-argument",
      "The email address provided is not valid.",
    );
  }

  const senderId = request.auth.uid;

  // Create a new document in a new "invites" collection in Firestore
  const inviteRef = await admin.firestore().collection("invites").add({
    listId: listId,
    senderId: senderId,
    recipientEmail: recipientEmail.toLowerCase(),
    status: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Return the unique ID of the new invitation document
  return { inviteId: inviteRef.id };
});