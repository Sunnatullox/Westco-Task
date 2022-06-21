const { Router } = require("express");
const mongoose = require("mongoose");
const path = require("path")
const uuid = require("uuid")
const CourseLesson = mongoose.model("CourseLesson");
const User = mongoose.model("User");
const CourseBooks = mongoose.model("Books");
const Auth = require("../middleware/Auth")
const router = Router();

router.post("/admin/lessson/create", Auth, async (req, res) => {
    const { name, description, courseId, adminId } = req.body;
    if (!adminId) {
        return res.status(402).json({ error: "adminId topilmadi darsni yuklab bo'lmadi agar adminId bo'lmasa" })
    }

    const lesson = req.files?.lesson;
    if (!name || !req.body.courseId) {
        return res.status(402).json({ error: "darslarni yuklashda name  courseId larni yuklash lozim" })
    }
    const fileName = lesson?.name
    const file = lesson && uuid.v4() + "-file-" + fileName
    lesson?.mv(path.resolve(__dirname, "..", "CourseFile", file))
    try {
        const user = await User.findById({ _id: adminId })

        // user adminniligini tekshirish
        if (user.userAdmin === true) {
            const coursLesson = new CourseLesson({ courseId, name, lesson: file, description })
            const lesson = await coursLesson.save()
            return res.status(200).json(lesson)
        } else if (user.userAdmin === false) {
            return res.status(401).json({ msg: "kechirasiz siz Admin emassiz sizga dars yuklash mumkinemas!" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "kechirasiz darslar yuklanmadi nimdir hato ketdi!" })
    }
})

router.put("/admin/lesson/update/:id", Auth, async (req, res, next) => {
    const { name, description } = req.body;
    const { id } = req.params;
    const lesson = req.files?.lesson;
    const fileName = lesson?.name

    const file = lesson && uuid.v4() + "-file-" + fileName
    lesson?.mv(path.resolve(__dirname, "..", "CourseFile", file))

    try {
        await CourseLesson.findByIdAndUpdate({ _id: id, },
            { $set: { name, lesson: file, description, } }, { new: true })
        return res.status(200).json({ msg: "kurs muvafaqiyatli o'zgartirildi" })
    } catch (error) {

        return res.status(500).json({ error: "kechirasiz darslar ozgartirilmadi nimadir hato ketdi!" })
    }
})

router.delete("/admin/lesson/delete/:id", Auth, async (req, res) => {
    const { id } = req.params;
    try {
        const coursLesson = await CourseLesson.findByIdAndDelete({ _id: id, })
        console.log(coursLesson)
        return res.status(200).json(coursLesson)
    } catch (error) {
        return res.status(500).json({ error: "kechirasiz darslar o'chirilmadi nimadir hato ketdi!" })
    }
})

router.post("/admin/courseBooks/create", Auth, async (req, res) => {
    const { courseId, name, urlBooks, description } = req.body;
    const coursBooks = req.files?.books;
    const filename = coursBooks.name

    try {
        const file = coursBooks && uuid.v4() + "-file" + filename
        coursBooks?.mv(path.resolve(__dirname, "..", "CourseFile", file))

        const createBooks = new CourseBooks({ name, books: file, urlBooks, description, courseId })

        const book = await createBooks.save()
        return res.status(200).json(book)

    } catch (error) {
        return res.status(500).json({ error: "ktobni yuklab bo'lmadi serverda hatolik!" })
    }
})


router.put("/admin/coursBooks/update/:id", Auth, async (req, res) => {
    const { id } = req.params;
    const { name, urlBooks, description } = req.body;
    const coursBooks = req.files?.books
    const fileName = coursBooks?.name
    try {
        const file = coursBooks && uuid.v4() + "-file" + fileName
        coursBooks?.mv(path.resolve(__dirname, "..", "CourseFile", file))

        await CourseBooks.findByIdAndUpdate({ _id: id },
            { $set: { name, urlBooks, description, books: file } })
        return res.status(200).json({ msg: "Kitob o'zgartitildi" })
    } catch (error) {
        return res.status(500).json({ error: "ktobni o'zgartirib bo'lmadi serverda hatolik!" })
    }
})
router.delete("/admin/coursBooks/delete/:id", Auth, async (req, res) => {
    const { id } = req.params;
    try {
        await CourseBooks.findByIdAndDelete({ _id: id })
        return res.status(200).json({ msg: "Kitob o'chirildi" })
    } catch (error) {
        return res.status(500).json({ error: "ktobni o'zgartirib bo'lmadi serverda hatolik!" })
    }
})


module.exports = router;