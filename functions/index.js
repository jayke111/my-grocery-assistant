// V2 SDK IMPORTS
const { onRequest } = require("firebase-functions/v2/https");
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
        // IMPORTANT: We need to retrieve the Firebase UID differently now.
        // We will look up the user by the email provided to the checkout session.
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

// This function is triggered by Firebase Auth, not a URL, so it's fine.
exports.onusercreate = onUserCreated(async (event) => {
    const user = event.data;
    const { uid, email } = user;
    logger.info(`New user signed up: ${uid}, Email: ${email}`);
    try {
        const batch = admin.firestore().batch();
        const userDocRef = admin.firestore().collection("users").doc(uid);
        batch.set(userDocRef, {
            email: email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            subscriptionStatus: "inactive",
        });
        await batch.commit();
        logger.info(`Successfully created all documents for new user: ${uid}`);
    } catch (error) {
        logger.error(`Failed to create documents for user: ${uid}`, error);
    }
});
