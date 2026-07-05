const Section = require('../models/Section');
const Lesson = require('../models/Lesson');

// @desc    Create a section
// @route   POST /api/sections
// @access  Private/Admin
const createSection = async (req, res, next) => {
  try {
    const { courseId, title, order } = req.body;

    if (!courseId || !title) {
      res.status(400);
      throw new Error('Please provide courseId and title');
    }

    const section = await Section.create({
      courseId,
      title,
      order: order !== undefined ? order : 0,
    });

    res.status(201).json(section);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a section
// @route   PUT /api/sections/:id
// @access  Private/Admin
const updateSection = async (req, res, next) => {
  try {
    const { title, order } = req.body;

    const section = await Section.findById(req.params.id);
    if (!section) {
      res.status(404);
      throw new Error('Section not found');
    }

    section.title = title || section.title;
    section.order = order !== undefined ? order : section.order;

    const updatedSection = await section.save();
    res.json(updatedSection);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a section (Cascading delete lessons inside it)
// @route   DELETE /api/sections/:id
// @access  Private/Admin
const deleteSection = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      res.status(404);
      throw new Error('Section not found');
    }

    // Delete all lessons inside this section
    await Lesson.deleteMany({ sectionId: section._id });

    await section.deleteOne();

    res.json({ message: 'Section and all lessons inside it deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSection,
  updateSection,
  deleteSection,
};
