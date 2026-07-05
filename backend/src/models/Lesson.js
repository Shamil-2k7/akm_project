const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a lesson title'],
      trim: true,
    },
    description: {
      type: String,
    },
    videoUrl: {
      type: String,
      required: [true, 'Please add a YouTube video URL'],
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

lessonSchema.index({ sectionId: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
