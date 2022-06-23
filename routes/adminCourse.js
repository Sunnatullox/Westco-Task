const { Router } = require("express");
const mongoose = require("mongoose");
const path = require("path")
const Course = mongoose.model("Course");
const CourseLesson = mongoose.model("CourseLesson");
const CourseBooks = mongoose.model("Books");
const CourseComment = mongoose.model("CourseComment");
const User = mongoose.model("User");
const uuid = require("uuid")
const Auth = require("../middleware/Auth")
const router = Router();
const { ObjectId } = mongoose.Types


router.get("/", async (req, res) => {
    try {
        const coursResult = await Course.aggregate([
            {
                $lookup:
                {
                    from: "courselessons",
                    localField: "_id",
                    foreignField: "courseId",
                    as: "lessons"
                }
            }, 
            {
                $lookup:
                {
                    from: "coursecomments",
                    localField: "_id",
                    foreignField: "courseId",
                    as: "comments"
                }
            },
            {
                $lookup:
                {
                    from: "books",
                    localField: "_id",
                    foreignField: "courseId",
                    as: "books"
                }
            },
        ])
        if (coursResult.length === 0) {
            return res.status(404).json({ msg: "Hozzircha Kurslar mavjud emas" })
        }
        return res.status(200).json({ cours: coursResult })
    } catch (error) {
        return res.status(500).json({ error: "Hechqanday kurs topilmadi Serverda hatolik" })
    }
})


router.get("/user/getCourseOne/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const coursResult = await Course.findById({_id:id})
        const CourseComments = await CourseComment.findOne({courseId:coursResult._id.toString()})
        
        if (!coursResult) {
            return res.status(404).json({ msg: "kechirasiz bunday kurs topilmadi id hato" })
        }
        return res.status(200).json({ cours: coursResult, comment: CourseComments })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Hechqanday kurs topilmadi Serverda hatolik" })
    }
})






router.get("/getCourseComment/:id",Auth, async (req, res) => {
    const { id } = req.params;

    try {
        const CourseComments = await CourseComment.findOne({_id:id})
        
        if (!CourseComments) {
            return res.status(404).json({ msg: "kechirasiz bunday comment topilmadi id hato" })
        }
        return res.status(200).json(CourseComments)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Hechqanday comment topilmadi Serverda hatolik" })
    }
})

router.get("/getCourseBook/:id",Auth, async (req, res) => {
    const { id } = req.params;

    try {
        const coursBooks = await CourseBooks.findOne({_id:id})
        
        if (!coursBooks) {
            return res.status(404).json({ msg: "kechirasiz bunday kitop topilmadi id hato" })
        }
        return res.status(200).json(coursBooks)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Hechqanday kitob topilmadi Serverda hatolik" })
    }
})



router.post("/admin/courseCreate", Auth, async (req, res) => {
    const { name, authorId, price, description } = req.body;

    const courseImg = req.files?.courseImg;
    if (!name || !authorId || !price) {
        return res.status(402).json({ error: "darslarni yuklashda name, price, courseImg larni yuklash lozim" })
    }
    const fileName = courseImg?.name
    const file = courseImg && uuid.v4() + "-file-" + fileName
    courseImg?.mv(path.resolve(__dirname, "..", "CourseFile", file))

    try {
        const user = await User.findById({ _id: authorId })
        // user adminniligini tekshirish
        if (user.userAdmin === true) {
            const course = new Course({
                name, price, authorId, courseImg: file, description
            })
            const savedCours = await course.save()
            return res.status(200).json(savedCours)

        } else if (user.userAdmin === false) {
            return res.status(401).json({ msg: "kechirasiz siz Admin emassiz sizga Kurs yuklash mumkinemas!" })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "kechirasiz kurs yuklanmadi Sereverda hatolik!" })
    }
})


router.put("/admin/courseUpdate/:id", Auth, async (req, res) => {
    const { name, price, description } = req.body;
    const { id } = req.params
    console.log(name, price, description, req.files)
    const courseImg = req.files?.courseImg;
    const fileName = courseImg?.name
    try {
        
            const file = courseImg && uuid.v4() + "-file-" + fileName
            courseImg?.mv(path.resolve(__dirname, "..", "CourseFile", file))
        const update = await Course.findByIdAndUpdate({ _id: id }, 
            { $set: { name, price, courseImg: file, description } },{new:true})
            console.log(update)
        return res.status(200).json({ msg: "Siz kursni muvafaqiyatli o'zgartirdingiz" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "kechirasiz kurs o'zgartirilmadi Serverda hatolik!" })
    }
})

router.delete("/admin/courseDelete/:id", Auth, async (req, res) => {
    const { id } = req.params
    try {
        await Course.findByIdAndDelete({ _id: id })
        return res.status(200).json({ msg: "kurs muvafaqiyatli o'chirildi" })
    } catch (error) {
        return res.status(500).json({ error: "kechirasiz kurs o'zgartirilmadi Serverda hatolik!" })
    }
})


module.exports = router;