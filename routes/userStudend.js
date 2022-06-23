const { Router } = require("express");
const mongoose = require("mongoose");
const Course = mongoose.model("Course");
const User = mongoose.model("User");
const CourseLesson = mongoose.model("CourseLesson");
const CourseBooks = mongoose.model("Books");
const CourseComment = mongoose.model("CourseComment");
const Auth = require("../middleware/Auth")
const bcrypt = require("bcryptjs");
const  uuid  = require("uuid");
const router = Router();
const path = require("path")

router.put("/user/cuourseEnrole/:id",Auth, async (req, res) => {
    //Course id params id hisoplanadi
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
        return res.status(402).json({ error: "kechirasiz userId topilmadi!" })
    }
    const userCourseSearch = await Course.findById({_id:id})

   const enrolledUser = userCourseSearch.courseUsersId.map((i) => i.toString() === userId.toString())
   const findUserCours = enrolledUser.find(i => i === true)
    
   if(findUserCours){
    return res.status(201).json({msg:"Siz bu kursni harid qilib bo'lgansiz!"})
    }
    try {
        const enroleCourseUser = await Course.findByIdAndUpdate({ _id: id },
            { $push: { courseUsersId: userId } }, { new: true })
        if (enroleCourseUser) {
            const userCourseEnrole = await User.findByIdAndUpdate({ _id: userId },
                { $push: { userCourseId: id } })
            return res.status(200).json({ enroleCourseUser, userCourseEnrole })
        }
    } catch (error) {
        return res.status(500).json({ error: "kechirasiz siz kursga yozilolmadingzi Serverda hatolik" })
    }
})


router.get("/user/getCourseProfile/:id",Auth, async (req, res) => {
    //User id chunkiy userning profelida courlarning idilari bor id hisoplanadi
    const { id } = req.params;

    try {
        const searchUser = await User.findById({_id:id})
        const userCourseId = await searchUser.userCourseId.map(i => i)
        const userCourse = await Course.find({_id:{$in:userCourseId}})

        // const coursLesson = await CourseLesson.findOne({courseId:{$in:userCourseId}})
        // const coursBooks = await CourseBooks.findOne({courseId:coursResult._id.toString()})
        // const CourseComments = await CourseComment.findOne({courseId:coursResult._id.toString()})

        return res.status(200).json(userCourse)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "kechirasiz siz kursga yozilolmadingzi Serverda hatolik" })
    }
})


router.get("/user/getCourseOneProfile/:id",Auth, async (req, res) => {
    const { id } = req.params;

    try {
        const coursResult = await Course.findById({_id:id})
        const coursLesson = await CourseLesson.findOne({courseId:coursResult._id.toString()})
        const coursBooks = await CourseBooks.findOne({courseId:coursResult._id.toString()})
        const CourseComments = await CourseComment.findOne({courseId:coursResult._id.toString()})
        
        if (!coursResult) {
            return res.status(404).json({ msg: "kechirasiz bunday kurs topilmadi id hato" })
        }
        return res.status(200).json({ cours: coursResult, lesson:coursLesson, books:coursBooks, comment: CourseComments })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Hechqanday kurs topilmadi Serverda hatolik" })
    }
})


router.put("/user/userCourseDelete/:id", Auth, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
        return res.status(402).json({ error: "kechirasiz userId topilmadi!" })
    }

    const userCourseSearch = await Course.findById({_id:id})

    const enrolledUser = userCourseSearch.courseUsersId.map((i) => i.toString() === userId.toString())
    const findUserCours = enrolledUser.find(i => i === true)

    
    if(!findUserCours){
     return res.status(201).json({msg:"Siz endi kursda mavjut emassiz"})
     }
    try {
        const courseDeletedUserId = await Course.findByIdAndUpdate({ _id: id },
            { $pull: { courseUsersId: userId } }, { new: true })
        if (courseDeletedUserId) {
            await User.findByIdAndUpdate({ _id: userId },
                { $pull: { userCourseId: id } })
            return res.status(200).json({msg:"Siz Kursdan o'chirildingiz" })
        }
    } catch (error) {
        return res.status(500).json({ error: "kechirasiz siz kursga yozilolmadingzi Serverda hatolik" })
    }
})

router.put("/user/profileUpdate", Auth, async (req, res) => {
    const { name, email, newPassword, userId, oldPassword } = req.body;
    const avatar = req.files?.userAvatar;

    try {

        const user = await User.findById({_id:userId})

        const adminpasscompair = await bcrypt.compare(oldPassword.toString(), user.password)

        if (!adminpasscompair) {
            return res.status(422).json({ msg: "Kechirasiz Admin paroliga sizning parolingiz to'g'ri kelmadi!" })
        }

        const file = avatar && uuid.v4() + "-userAvatar" + ".jpg" 
        avatar?.mv(path.resolve(__dirname, "..", "CourseFile", file  ))

        const bcryptjs = await bcrypt.hash(newPassword, 10);
            const userCourseEnrole = await User.findByIdAndUpdate({ _id: userId },
                { $set:{name, email, password:bcryptjs, userAvatar:file}, })
            return res.status(200).json(userCourseEnrole)
        
    } catch (error) {
        return res.status(500).json({ error: "Kechirasiz profil malumotlaringiz o'zgarmadi Serverda hatolik" })
    }
})


router.post("/user/forgotPassword/searchUser",Auth,async(req, res) => {
    const { email } = req.body;
    if(!email){
        return res.status(400).json({msg:"email topilmadi emailni kiritib qaytadan urinib ko'ring"})
    }
    try {
        const userSearch = await User.findOne({email:email})
        
        if(!userSearch){
            return res.status(404).json({msg:"kechirasiz bunday email ro'yhatdan o'tmagan boshqa email kiriting!"})
        }
        return res.status(200).json(userSearch)
    } catch (error) {
        console.log(error)
    }
})

router.post("/user/fotgetPassword/updatedPasword", Auth, async(req, res) => {
    const { userId, password } = req.body;
    if(!userId || !password){
        return res.status(400).json({msg:"parol topilmadi parolni kiritib qaytadan urinib ko'ring"})
    }
    try {
        const bcryptjs = await bcrypt.hash(password.toString(), 10);
        const userupdatePass = await User.findByIdAndUpdate({_id:userId},
            {$set :{ password:bcryptjs }})
        
            return res.status(200).json(userupdatePass)
    } catch (error) {
        console.log(error)
    }
})

module.exports = router;