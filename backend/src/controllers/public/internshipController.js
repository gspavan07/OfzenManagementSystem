const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const InternBatch = require("../../models/InternBatch");
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Intern = require("../../models/Intern");
const { sendRegistrationSuccessEmail } = require("../../utils/careerMailer");

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
});

const Internship = require("../../models/Internship");

// GET /api/public/internships/batches (Now returns Internship Roles, with alias for compatibility)
const getActiveBatches = asyncHandler(async (req, res) => {
  const internships = await Internship.find({ status: "active" }).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    internships,
    // batches: internships, // Alias for backward compatibility with existing careers site
  });
});

// POST /api/public/internships/check-email
const checkEmailAvailability = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }
  const userExists = await User.findOne({ email });

  if (userExists) {
    // We return success: true but exists: true so the frontend can show a warning
    return res.json({
      success: true,
      exists: true,
      message:
        "An account already exists with this email address. Please use a different email or login.",
    });
  }
  res.json({ success: true, exists: false });
});

// POST /api/public/internships/create-order
const createOrder = asyncHandler(async (req, res) => {
  const { internshipId, batchId } = req.body;
  const id = internshipId || batchId; // Support both old and new nomenclature

  const internship = await Internship.findById(id);

  if (!internship) {
    res.status(404);
    throw new Error("Internship role not found");
  }

  const amount = internship.fee * 100; // in paise
  const currency = "INR";

  const options = {
    amount,
    currency,
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await rzp.orders.create(options);
    res.json({ success: true, order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({
      success: false,
      message: error.description || "Razorpay order creation failed",
      details: error,
    });
  }
});

// POST /api/public/internships/register
const registerIntern = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    gender,
    password,
    college,
    course,
    passOutYear,
    internshipId,
    batchId, // Backward compatibility
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const id = internshipId || batchId;

  // 1. Verify Payment Signature
  const hmac = crypto.createHmac(
    "sha256",
    process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
  );
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed");
  }

  // 2. Fetch Intern Profile
  const internProfile = await Profile.findOne({ label: "Intern" });
  if (!internProfile) {
    res.status(500);
    throw new Error("Intern profile configuration missing in system");
  }

  // 3. Create User
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  const user = await User.create({
    name,
    email,
    phone,
    gender,
    password,
    profileId: internProfile._id,
  });

  // 4. Create Intern Record (Removed Auto-Batching as per requirement)
  await Intern.create({
    userId: user._id,
    internshipId: id,
    // batchId remains undefined/null until manual approval
    college,
    course,
    passOutYear,
    paymentStatus: "paid",
    receiptNumber: razorpay_payment_id,
    registrationStatus: "pending",
  });

  // 6. Send Confirmation Email
  // try {
  //   const refNumber = `OFZ-INT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  //   await sendRegistrationSuccessEmail({
  //     name,
  //     email,
  //     refNumber,
  //     batchName: batch.batchName,
  //     domain: internship.domain,
  //     paymentId: razorpay_payment_id,
  //   });
  // } catch (mailError) {
  //   console.error("Failed to send registration email:", mailError);
  // }

  res.status(201).json({ success: true, message: "Registration successful" });
});

module.exports = {
  getActiveBatches,
  createOrder,
  registerIntern,
  checkEmailAvailability,
};
