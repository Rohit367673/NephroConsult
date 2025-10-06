import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String }, // Not required for Firebase users
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient', index: true },
    country: { type: String },
    phone: { type: String },
    avatar: { type: String },
    // Firebase specific fields
    firebaseUid: { type: String, unique: true, sparse: true, index: true },
    photoURL: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    authProvider: { type: String, enum: ['email', 'google'], default: 'email' },
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
