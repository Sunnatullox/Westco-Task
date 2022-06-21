const { model, Schema } = require("mongoose");
const { ObjectId } = Schema.Types

const course = new Schema({
    name: String,
    authorId: {
        type: ObjectId,
        ref: "User"
    },
    price: {
        type: Number,
        default: 0
    },
    courseImg: String,
    courseUsersId: [{
        type: ObjectId,
        ref: "User"
    }],
    reating: {
        type: Number,
        default: 0
    },
    description: String,
}, {
    timestamps: true,
})

model("Course", course)