import mongoose from 'mongoose';

/**
 * Atomic sequence counter used to generate sequential, human-friendly
 * order ids (e.g. ZYV-2026-000001). One document per sequence key.
 */
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);
export default Counter;
