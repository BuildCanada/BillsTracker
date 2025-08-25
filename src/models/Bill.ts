import mongoose, { Schema, model, models } from "mongoose";

// Interface for each tenet evaluation object within the 'tenet_evaluations' array
export interface TenetEvaluation {
  id: number;
  title: string;
  alignment: "conflicts" | "aligns" | "neutral";
  explanation: string;
}

// Existing interfaces for vote and stage records
export interface VoteRecord {
  chamber: string;
  date: Date;
  motion?: string;
  result: string;
  yeas?: number;
  nays?: number;
  abstentions?: number;
  source?: string; // link to official vote record
}

export interface StageRecord {
  stage: string; // e.g., "First Reading", "Committee", "Third Reading"
  state?: string; // e.g., "Completed", "In Committee"
  house?: string; // e.g., "House of Commons", "Senate"
  date?: Date;
}

// Updated main interface for the Bill document
export interface BillDocument extends mongoose.Document {
  billId: string; // e.g., C-18, S-5
  parliamentNumber?: number; // e.g., 45
  sessionNumber?: number; // e.g., 1
  title: string;
  shortTitle?: string;
  summary: string; // human-friendly summary

  // Replaced the old 'analysis' object with new, top-level fields
  tenet_evaluations: TenetEvaluation[];
  final_judgment: string; // "yes", "no", or "neutral"
  rationale: string;
  needs_more_info: boolean;
  missing_details: string[];

  status: string;
  sponsorName?: string;
  sponsorParty?: string;
  chamber: string;
  genres?: string[]; // categories/tags
  supportedRegion?: string; // e.g., "Canada"
  introducedOn?: Date;
  lastUpdatedOn?: Date;
  source?: string; // canonical source link
  stages?: StageRecord[];
  votes?: VoteRecord[];
  billTextsCount?: number; // track number of bill texts to detect changes
}

// Schema for the Tenet Evaluation sub-document
const TenetEvaluationSchema = new Schema<TenetEvaluation>({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  alignment: { type: String, enum: ["conflicts", "aligns", "neutral"], required: true },
  explanation: { type: String, required: true },
}, { _id: false }); // _id: false prevents Mongoose from adding an _id to each sub-document

// Existing schemas for vote and stage records
const VoteSchema = new Schema<VoteRecord>({
  chamber: { type: String, enum: ["House of Commons", "Senate"], required: true },
  date: { type: Date, required: true },
  motion: { type: String },
  result: { type: String, required: true },
  yeas: { type: Number },
  nays: { type: Number },
  abstentions: { type: Number },
  source: { type: String },
});

const StageSchema = new Schema<StageRecord>({
  stage: { type: String, required: true },
  state: { type: String },
  house: { type: String },
  date: { type: Date },
});

// Updated main Bill Schema
const BillSchema = new Schema<BillDocument>(
  {
    billId: { type: String, required: true, index: true },
    parliamentNumber: { type: Number },
    sessionNumber: { type: Number },
    title: { type: String, required: true },
    shortTitle: { type: String },
    summary: { type: String, required: true },

    // Replaced the old 'analysis' sub-schema with new fields
    tenet_evaluations: { type: [TenetEvaluationSchema], default: [] },
    final_judgment: { type: String, enum: ["yes", "no", "neutral"] },
    rationale: { type: String },
    needs_more_info: { type: Boolean, default: false },
    missing_details: { type: [String], default: [] },

    status: { type: String, required: true },
    sponsorName: { type: String },
    sponsorParty: { type: String },
    chamber: { type: String, required: true },
    genres: [{ type: String }],
    supportedRegion: { type: String },
    introducedOn: { type: Date },
    lastUpdatedOn: { type: Date },
    source: { type: String },
    stages: { type: [StageSchema], default: [] },
    votes: { type: [VoteSchema], default: [] },
    billTextsCount: { type: Number },
  },
  { timestamps: true }
);

BillSchema.index({ billId: 1, parliamentNumber: 1 }, { unique: true, sparse: true });
BillSchema.index({ title: "text", shortTitle: "text", summary: "text" });

export const Bill = models.Bill || model<BillDocument>("Bill", BillSchema);
