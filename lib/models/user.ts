import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'user' | 'admin' | 'moderator';
export type Provider = 'credentials' | 'google' | 'github';
export type Subscription = 'free' | 'premium' | 'enterprise';

export interface IDevice {
  id: string;
  deviceType: string;
  browser: string;
  os: string;
  ip: string;
  location?: string;
  lastActive: Date;
  isCurrentDevice?: boolean;
}

export interface INotification {
  id: string;
  type: 'security' | 'info' | 'warning';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface IUser extends mongoose.Document {
  email: string;
  password?: string;
  name?: string;
  image?: string;
  phone: string;
  isPhoneVerified: boolean;
  phoneVerificationCode?: string;
  phoneVerificationCodeExpiry?: Date;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
  role: UserRole;
  provider: Provider;
  providerId?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  subscription: Subscription;
  lastLogin?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  devices: IDevice[];
  notifications: INotification[];
  preferences: {
    emailNotifications: boolean;
    loginAlerts: boolean;
    newsletter: boolean;
    theme: 'light' | 'dark' | 'system';
    rememberMe: boolean;
  };
  loginHistory: Array<{
    timestamp: Date;
    ip: string;
    userAgent: string;
    location?: string;
    success: boolean;
  }>;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    name: String,
    image: String,
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationCode: String,
    phoneVerificationCodeExpiry: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpiry: Date,
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    provider: {
      type: String,
      enum: ['credentials', 'google', 'github'],
      default: 'credentials',
    },
    providerId: String,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    backupCodes: [String],
    subscription: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free',
    },
    lastLogin: Date,
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    devices: [{
      id: String,
      deviceType: String,
      browser: String,
      os: String,
      ip: String,
      location: String,
      lastActive: Date,
      isCurrentDevice: Boolean,
    }],
    notifications: [{
      type: {
        type: String,
        enum: ['security', 'info', 'warning'],
      },
      title: String,
      message: String,
      read: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      loginAlerts: {
        type: Boolean,
        default: true,
      },
      newsletter: {
        type: Boolean,
        default: false,
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      rememberMe: {
        type: Boolean,
        default: false,
      },
    },
    loginHistory: [{
      timestamp: {
        type: Date,
        default: Date.now,
      },
      ip: String,
      userAgent: String,
      location: String,
      success: Boolean,
    }],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

userSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  this.failedLoginAttempts += 1;

  if (this.failedLoginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
  }

  await this.save();
};

userSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  await this.save();
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);