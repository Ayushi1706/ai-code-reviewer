const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        code: {
            type: String,
            required: true
        },
        language: {
            type: String,
            required: true
        },
        score: {
            type: Number,
            required: true
        },
        summary: {
            type: String,
            required: true
        },
        counts: {
            critical: { type: Number, default: 0},
            high: { type: Number, default: 0},
            medium: { type: Number, default: 0},
            low: { type: Number, default: 0},
            info: { type: Number, default: 0},
        },

        categories: {
            bestPractices: { type: Number, default: 0 },
            bugs: { type: Number, default: 0 },
            performance: { type: Number, default: 0 },
            security: { type: Number, default: 0 },
          },
        
          customMatch: {
            type: Number,
            default: 0,
          },
        
          issues: [
            {
              line: {
                type: Number,
                
              },
              severity: {
                type: String,
                enum: ['critical', 'high', 'medium', 'low', 'info'],
              },
              type: {
                type: String,
                enum: ['bugs', 'performance', 'security', 'bestPractices'],
                
              },
              description: {
                type: String,
                
              },
              suggestion: {
                type: String,
              }
            }
          ],
          createdAt: {
            type: Date,
            default: Date.now
          }
});


module.exports = mongoose.model('Review', reviewSchema);