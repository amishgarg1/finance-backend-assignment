const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      required: [true, 'Please specify type (income or expense)'],
      enum: ['income', 'expense'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot be more than 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for easier aggregation and querying
recordSchema.index({ type: 1, date: -1 });
recordSchema.index({ category: 1 });
recordSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Record', recordSchema);
