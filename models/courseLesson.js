const { model, Schema } = require("mongoose");
const { ObjectId } = Schema.Types

const courseLesson = new Schema({
    courseId: {
        type: ObjectId,
        ref: "Course"
    },
    name: String,
    lesson:String,
    completedLesson:[{
        type: ObjectId,
        ref:"User"
    }],
    description: String
}, {
    timestamps: true,
})

model("CourseLesson", courseLesson)