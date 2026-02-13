import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reportId: {
    type: Number,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['plastic', 'paper', 'metal', 'glass', 'organic', 'ewaste', 'other'],
    default: 'other'
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  // ⭐⭐⭐ THIS IS THE NEW CRITICAL FIELD ⭐⭐⭐
  assignedZone: {
    type: String,
    default: 'Zone 5 - Central Gonda'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  estimatedCredits: Number,
  photoUrl: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verifiedAt: Date,
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  },
  adminNotes: String,
  workerNotes: String,
  completionPhotoUrl: String,

  // 🛡️ INTEGRITY FIELDS
  photoHash: { type: String, index: true }, // For duplicate detection
  aiTags: [String],                         // AI Detected labels (e.g. ["bottle", "plastic"])
  aiConfidence: Number                      // AI Confidence score
}, {
  timestamps: true
});

// Geospatial index for location-based queries
reportSchema.index({ location: '2dsphere' });

// Index for efficient zone filtering
reportSchema.index({ assignedZone: 1, status: 1 });

export default mongoose.model('Report', reportSchema);
