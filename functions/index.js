// V2 SDK IMPORTS
const { onCall, onRequest } = require("firebase-functions/v2/https");
const { onUserCreated } = require("firebase-functions/v2/auth");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const stripe = require("stripe");

admin.initializeApp();

// This is a Callable Function that securely accesses secrets from Secret Manager.
exports.createstripecheckout = onCall({ secrets: ["STRIPE_SECRET_KEY"] }, async (request) => {
    if (!request.auth) {
        logger.error("User is not authenticated for callable function.");
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email;
    const { priceId } = request.data;

    if (!priceId) {
        logger.error("Missing Price ID in callable function data.");
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "priceId" argument.');
    }

    try {
        // The secret is automatically loaded into process.env
        const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            success_url: "https://cartspark-85cbc.web.app/success",
            cancel_url: "https://cartspark-85cbc.web.app",
            customer_email: email,
            line_items: [{ price: priceId, quantity: 1 }],
            client_reference_id: uid,
        });

        logger.info("Stripe session created successfully for user:", uid);
        return { id: session.id };
    } catch (error) {
        logger.error("Stripe session creation failed:", error);
        throw new functions.https.HttpsError('internal', 'Unable to create Stripe checkout session.');
    }
});

// This webhook also securely accesses secrets from Secret Manager.
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
        const firebaseUID = session.client_reference_id;
        try {
            const userDocRef = admin.firestore().collection("users").doc(firebaseUID);
            await userDocRef.update({
                subscriptionStatus: "active",
                stripeCustomerId: session.customer,
            });
            logger.info(`Successfully granted Pro access to user: ${firebaseUID}`);
        } catch (err) {
            logger.error("Failed to grant Pro access:", err);
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
