import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
});

const bugSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: null,
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
        },
        severity: {
            type: String,
            enum: ["Minor", "Major", "Critical"],
            default: "Minor",
        },
        status: {
            type: String,
            enum: ["Open", "In Progress", "Closed"],
            default: "Open",
        },
        dueDate: {
            type: Date,
        },
        module: {
            type: String,
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        assignedTo: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          }],
        attachments: [
            {
                type: String,
            },
        ],
        checklist: [checklistItemSchema],
    },
    {
        timestamps: true,
    }
);

const Bug = mongoose.model("Bug", bugSchema);
export default Bug;
