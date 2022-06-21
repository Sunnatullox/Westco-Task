const { Router } = require("express");
const  mongoose  = require("mongoose");
const CourseComment = mongoose.model("CourseComment");
const router = Router();
const Auth = require("../middleware/Auth")

router.post("/user/courseComment/create",Auth, async(req,res) => {
    const { description, userId, name, courseId} = req.body;
    
    try {
        const createComment = new CourseComment({ courseId, name, description, userId})
          const comment = await createComment.save()

                return res.status(200).json(comment)
    } catch (error) {
        return res.status(402).json({error:"kurga komment yozib bo'lmadi"})
    }
})

router.put("/user/courseComment/update/:id",Auth, async(req, res) => {
    const {id} = req.params;
    const { description, name} = req.body
    if(!description || !name){
        return res.status(422).json({error:"inputlar to'dirilmadi iltimos malumotlarni kiriting"})
    }
    try {
        const updateComment =await CourseComment.findByIdAndUpdate({_id:id},
            {$set:{description, name}},{new:true})
            console.log(updateComment)
            return res.status(200).json(updateComment)
    } catch (error) {
        return res.status(500).json({error:"comment o'zgartirilmadi serverda hatolik"})
    }
})
router.delete("/user/courseComment/delete/:id",Auth, async(req, res) => {
    const {id} = req.params;
    try {
        const updateComment = await CourseComment.findByIdAndDelete({_id:id})
        return res.status(200).json(updateComment)
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:"comment o'zgartirilmadi serverda hatolik"})
    }
})


module.exports = router;