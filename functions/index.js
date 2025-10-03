const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe");

admin.initializeApp();

// --- STRIPE WEBHOOK (V1) ---
exports.stripewebhook = functions
  .runWith({ secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] })
  .https.onRequest(async (request, response) => {
    const signature = request.headers["stripe-signature"];
    let event;
    try {
        const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
        event = stripeClient.webhooks.constructEvent(request.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        functions.logger.error("Webhook signature verification failed.", err);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const firebaseUID = session.client_reference_id;
        if (!firebaseUID) {
            functions.logger.error("No client_reference_id found in Stripe session.");
            return response.status(400).send("Bad Request: Missing client_reference_id.");
        }
        try {
            const userDocRef = admin.firestore().collection("users").doc(firebaseUID);
            await userDocRef.update({
                subscriptionStatus: "active",
                stripeCustomerId: session.customer,
            });
            functions.logger.info(`Granted Pro access to user: ${firebaseUID}`);
        } catch (err) {
            functions.logger.error(`Failed to grant Pro access for user ${firebaseUID}:`, err);
            return response.status(500).send("Internal Server Error");
        }
    }
    response.status(200).send();
});

// --- ON NEW USER CREATION (V1) ---
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
    const { uid, email } = user;
    functions.logger.info(`New user signed up: ${uid}, Email: ${email}`);
    try {
        const batch = admin.firestore().batch();

        const userDocRef = admin.firestore().collection("users").doc(uid);
        batch.set(userDocRef, {
            email: email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            subscriptionStatus: "inactive",
        });

        const mealPlanDocRef = admin.firestore().collection("mealPlans").doc(uid);
        batch.set(mealPlanDocRef, {
            ownerId: uid,
            planVersion: 2,
            days: {
                Sunday: { breakfast: [], lunch: [], dinner: [] },
                Monday: { breakfast: [], lunch: [], dinner: [] },
                Tuesday: { breakfast: [], lunch: [], dinner: [] },
                Wednesday: { breakfast: [], lunch: [], dinner: [] },
                Thursday: { breakfast: [], lunch: [], dinner: [] },
                Friday: { breakfast: [], lunch: [], dinner: [] },
                Saturday: { breakfast: [], lunch: [], dinner: [] }
            }
        });

        await batch.commit();
        functions.logger.info(`Created initial documents for: ${uid}`);

    } catch (error) {
        functions.logger.error(`Failed to create initial documents for user: ${uid}`, error);
    }
});

// --- CREATE STRIPE PORTAL LINK (V1) ---
// This function creates a secure link to the Stripe customer portal for a user.
exports.createStripePortalLink = functions
  // --- THIS IS THE FIX ---
  // This line was missing. It gives the function permission to access the Stripe secret key.
  .runWith({ secrets: ["STRIPE_SECRET_KEY"] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }
    try {
        const uid = context.auth.uid;
        const userDoc = await admin.firestore().collection("users").doc(uid).get();
        const stripeCustomerId = userDoc.data()?.stripeCustomerId;
        if (!stripeCustomerId) {
            throw new functions.https.HttpsError("not-found", "Stripe customer ID not found.");
        }
        
        const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
        
        const portalSession = await stripeClient.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `https://cartspark-85cbc.web.app/profile`,
        });
        
        return { url: portalSession.url };
    } catch (error) {
        functions.logger.error(`Error creating Stripe portal link: ${error.message}`);
        throw new functions.https.HttpsError("internal", "Could not create a portal session.");
    }
});

