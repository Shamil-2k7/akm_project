const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a section title'],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for faster sorting and filtering
sectionSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model('Section', sectionSchema);
