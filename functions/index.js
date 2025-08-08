// V2 SDK IMPORTS
const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { onUserCreated } = require("firebase-functions/v2/auth");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const stripe = require("stripe");

admin.initializeApp();

// This webhook securely accesses secrets from Secret Manager.
// It MUST remain public so Stripe's servers can call it.
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
        // Retrieve the Firebase UID from the metadata we passed during checkout.
        const firebaseUID = session.client_reference_id;

        if (!firebaseUID) {
            logger.error("No client_reference_id (Firebase UID) found in Stripe session.");
            return response.status(400).send("Bad Request: Missing client_reference_id.");
        }

        try {
            const userDocRef = admin.firestore().collection("users").doc(firebaseUID);
            await userDocRef.update({
                subscriptionStatus: "active",
                stripeCustomerId: session.customer,
            });
            logger.info(`Successfully granted Pro access to user: ${firebaseUID}`);
        } catch (err) {
            logger.error(`Failed to grant Pro access for user ${firebaseUID}:`, err);
            return response.status(500).send("Internal Server Error");
        }
    }
    response.status(200).send();
});

// This function is triggered by Firebase Auth, not a URL, so it's fine.
exports.onUserCreated = onUserCreated(async (event) => {
    const user = event.data;
    const { uid, email } = user;
    logger.info(`New user signed up: ${uid}, Email: ${email}`);
    try {
        const userDocRef = admin.firestore().collection("users").doc(uid);
        // Use a transaction with .create() for a more robust write.
        // .create() will fail if the document already exists, preventing accidental overwrites.
        await admin.firestore().runTransaction(async (transaction) => {
            transaction.create(userDocRef, {
                email: email,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                subscriptionStatus: "inactive",
            });
        });
        logger.info(`Successfully created user document for new user: ${uid}`);
    } catch (error) {
        // If the error is that the document already exists, it's not a critical failure.
        // This can happen if the function is triggered more than once for the same user.
        if (error.code === 6) { // Firestore error code for ALREADY_EXISTS
            logger.warn(`User document for ${uid} already exists. Function may have run twice.`);
        } else {
            logger.error(`Failed to create user document for user: ${uid}`, error);
        }
    }
});

// Add this new function at the end of your functions/index.js file

exports.createShareInvite = onCall(async (request) => {
  // Ensure the user is logged in
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to share a list.",
    );
  }

  const { listId, recipientEmail } = request.data;

  // Validate the data received from the front-end
  if (!listId || !recipientEmail) {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with a 'listId' and 'recipientEmail'.",
    );
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    throw new HttpsError(
      "invalid-argument",
      "The email address provided is not valid.",
    );
  }

  const senderId = request.auth.uid;

  // Security Check: Verify the sender is a member of the list they want to share.
  const listRef = admin.firestore().collection("lists").doc(listId);
  const listDoc = await listRef.get();

  if (!listDoc.exists) {
    throw new HttpsError("not-found", "The specified list does not exist.");
  }

  const listData = listDoc.data();
  if (!listData.members || !listData.members.includes(senderId)) {
    throw new HttpsError(
      "permission-denied",
      "You do not have permission to share this list.",
    );
  }

  try {
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
  } catch (error) {
    logger.error("Failed to create share invite:", error);
    throw new HttpsError(
      "internal",
      "An error occurred while creating the invitation.",
    );
  }
});
