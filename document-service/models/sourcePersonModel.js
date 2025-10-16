const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const sourcePersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    validate: {
      validator: function(mobile) {
        return /^[0-9]{10}$/.test(mobile);
      },
      message: 'Please enter a valid 10-digit mobile number'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  county: {
    type: String,
    required: [true, 'County is required'],
    trim: true,
    maxlength: [50, 'County cannot exceed 50 characters']
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
sourcePersonSchema.index({ mobile: 1 });
sourcePersonSchema.index({ email: 1 });
sourcePersonSchema.index({ status: 1 });
sourcePersonSchema.index({ city: 1 });
sourcePersonSchema.index({ state: 1 });

// Virtual for full address
sourcePersonSchema.virtual('fullAddress').get(function() {
  return `${this.city}, ${this.state}, ${this.county}`;
});

// Static method to check if mobile exists
sourcePersonSchema.statics.isMobileExists = async function(mobile, excludeId = null) {
  const query = { mobile };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await this.exists(query);
};

// Static method to check if email exists
sourcePersonSchema.statics.isEmailExists = async function(email, excludeId = null) {
  const query = { email: email.toLowerCase() };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await this.exists(query);
};

// Pre-save middleware
sourcePersonSchema.pre('save', function(next) {
  // Trim and format fields
  if (this.name) this.name = this.name.trim();
  if (this.mobile) this.mobile = this.mobile.trim();
  if (this.email) this.email = this.email.toLowerCase().trim();
  if (this.city) this.city = this.city.trim();
  if (this.state) this.state = this.state.trim();
  if (this.county) this.county = this.county.trim();
  
  next();
});

// Add pagination plugin
sourcePersonSchema.plugin(mongoosePaginate);

module.exports = mongoose.models.SourcePerson || mongoose.model('SourcePerson', sourcePersonSchema);