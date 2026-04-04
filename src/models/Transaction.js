const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Type is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      // keeping it open ended so admin can use any category
      // like salary, rent, food, freelance etc
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false // soft delete
    }
  },
  { timestamps: true }
)

// whenever we fetch transactions, skip soft deleted ones by default
transactionSchema.pre(/^find/, function () {
  this.where({ isDeleted: false })
})

module.exports = mongoose.model('Transaction', transactionSchema)