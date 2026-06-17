import mongoose from 'mongoose';

const campusLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const CampusLocation = mongoose.model('CampusLocation', campusLocationSchema);

export default CampusLocation;
