const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const InternBatch = require('../../models/InternBatch');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Intern = require('../../models/Intern');
const { sendRegistrationSuccessEmail } = require('../../utils/careerMailer');

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

const Internship = require('../../models/Internship');

// GET /api/public/internships/batches (Now returns Internship Roles, with alias for compatibility)
const getActiveBatches = asyncHandler(async (req, res) => {
  const internships = await Internship.find({ status: 'active' })
    .sort({ createdAt: -1 });
    
  res.json({ 
    success: true, 
    internships,
    batches: internships // Alias for backward compatibility with existing careers site
  });
});

// POST /api/public/internships/create-order
const createOrder = asyncHandler(async (req, res) => {
  const { internshipId, batchId } = req.body;
  const id = internshipId || batchId; // Support both old and new nomenclature
  
  const internship = await Internship.findById(id);
  
  if (!internship) {
    res.status(404);
    throw new Error('Internship role not found');
  }

  const amount = internship.fee * 100; // in paise
  const currency = 'INR';

  const options = {
    amount,
    currency,
    receipt: `receipt_${Date.now()}`,
  };

  const order = await rzp.orders.create(options);
  res.json({ success: true, order, keyId: process.env.RAZORPAY_KEY_ID });
});

// POST /api/public/internships/register
const registerIntern = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    college,
    course,
    internshipId,
    batchId, // Backward compatibility
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const id = internshipId || batchId;

  // 1. Verify Payment Signature
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder');
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed');
  }

  // 2. Fetch Intern Profile
  const internProfile = await Profile.findOne({ label: 'Intern' });
  if (!internProfile) {
    res.status(500);
    throw new Error('Intern profile configuration missing in system');
  }

  // 3. Create User
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    profileId: internProfile._id,
  });

  // 4. Auto-Batching Logic
  const Internship = require('../../models/Internship');
  const InternBatch = require('../../models/InternBatch');
  const internship = await Internship.findById(id);
  
  // Find latest upcoming batch for this internship
  let batch = await InternBatch.findOne({ 
    internshipId: id, 
    status: 'upcoming' 
  }).sort({ createdAt: -1 });

  // If batch exists, check count
  if (batch) {
    const currentCount = await Intern.countDocuments({ batchId: batch._id });
    if (currentCount >= 20) {
      // Batch full, create new one
      const batchCount = await InternBatch.countDocuments({ internshipId: id });
      batch = await InternBatch.create({
        batchName: `${internship.title} - Batch ${batchCount + 1}`,
        internshipId: id,
        domain: internship.domain,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default +7 days
        endDate: new Date(Date.now() + 67 * 24 * 60 * 60 * 1000), // Default +2 months
        status: 'upcoming',
        fee: internship.fee
      });
    }
  } else {
    // No batch exists, create first one
    batch = await InternBatch.create({
      batchName: `${internship.title} - Batch 1`,
      internshipId: id,
      domain: internship.domain,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 67 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      fee: internship.fee
    });
  }

  // 5. Create Intern Record
  await Intern.create({
    userId: user._id,
    internshipId: id,
    batchId: batch._id,
    college,
    course,
    paymentStatus: 'paid',
    receiptNumber: razorpay_payment_id,
    registrationStatus: 'pending',
  });

  // 6. Send Confirmation Email
  try {
    const refNumber = `OFZ-INT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    await sendRegistrationSuccessEmail({
      name,
      email,
      refNumber,
      batchName: batch.batchName,
      domain: internship.domain,
      paymentId: razorpay_payment_id,
    });
  } catch (mailError) {
    console.error('Failed to send registration email:', mailError);
  }

  res.status(201).json({ success: true, message: 'Registration successful' });
});

module.exports = {
  getActiveBatches,
  createOrder,
  registerIntern,
};
