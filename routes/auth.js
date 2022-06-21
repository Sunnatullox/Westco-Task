const { Router } = require("express");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const  JWT_SECRET = process.env.JWT_SECRET;
const router = Router();

router.post("/signUp", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(422).json({ error: "iltimos barcha malumotlarni to'liq kiriting nimadir qolib ketdi" })
    }


    try {
        // rearch user email
        const users = await User.findOne({ email })
        if (users) {
            return res.status(422).json({ error: "bunday email avval ro'yhatdan o'tgan" })
        }
        if (!users) {
            // user password hashed
            const bcryptjs = await bcrypt.hash(password, 10);
            // user data db connected
            const user = new User({
                name, email, password: bcryptjs
            })
            // connected data saved
            const signUser =await user.save()
            console.log(user,signUser);
            return res.status(200).json({ msg: "siz muvafaqiyatli ro'yhatdan o'tdingiz" })
        }
    } catch (error) {
       return res.status(500).json({ error: "ro'yhatdan o'tib bo'lmadi qaytadan urinib ko'ring" })
    }
})


router.post("/signIn", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ error: "iltimos barcha malumotlarni to'liq kiriting nimadir qolib ketdi" })
    }
    try {
        // search user
        const userData = await User.findOne({ email })

        if (!userData) {
            return res.status(422).json({ error: "bunday email ro'yhatdan o'tmagan iltimos avval ro'yhatdan o'ting" })
        }
        //user password compaired
        const userPassed = await bcrypt.compare(password, userData.password)
        if (userPassed) {
            // created user token
            const token = jwt.sign({ _id: userData._id }, JWT_SECRET)

            const { name, email, _id, userAdmin, userCourse, userAvatar } = userData;
            return res.status(200).json({ token, user: { name, email, _id, userAdmin, userCourse, userAvatar } })
        }else if(!userPassed){
            return res.status(422).json({error:"parolingiz hato tekshirib qayta urinib ko'ring!"})
        }
    } catch (error) {
        return  res.status(500).json({ error: "akountga kirib bo'ladi qaytadan urinib ko'ring" })
    }
})




module.exports = router;