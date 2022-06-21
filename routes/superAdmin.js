const { Router } = require("express");
const mongoose = require("mongoose");
const SuperAdmin = mongoose.model("SuperAdmin");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const User = mongoose.model("User")
const Auth = require("../middleware/Auth");
const uuid  = require("uuid");
const router = Router();
const path = require("path")

// Super Admin Sign Up
router.post("/superAdmin/signUp", async (req, res) => {
    const { name, email, password, secretInfo } = req.body;

    if (!name || !email || !password || !secretInfo) {
        return res.status(422).json({ error: "Iltimos barcha malumotlarni to'liq kiriting nimadir qolib ketdi" })
    }

    try {
        const SuperAdminData = await SuperAdmin.find()
        if (SuperAdminData.length >= 1) {
            res.status(422).json({ error: "SuperAdmin 1 marta ro'yhatdan o'tgan qaytib ro'yhatdan o'tib bo'lmaydi." })
            return
        }

        // search SuperAdmin data
        const user = await SuperAdmin.findOne({ email })
        if (user) {
            return res.status(422).json({ error: "bunday email avval ro'yhatdan o'tgan" })
        }
        if (!user) {
            // SuperAdmin password hashed
            const bcrypt = await bcryptjs.hash(password.toString(), 10);
            const bcryptjsSecretInfo = await bcryptjs.hash(secretInfo.toString(), 10);
            // SuperAdmin data db connected
            const user = new SuperAdmin({
                name, email, secretInfo: bcryptjsSecretInfo, password: bcrypt
            })
            // connected data saved
            await user.save()
            return res.status(200).json({ msg: "Admin Panelga ro'yhatdan o'tdingiz!" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "ro'yhatdan o'tib bo'lmadi qaytadan urinib ko'ring" })
    }
})

// Super Admin Sign In
router.post("/superAdmin/signIn", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ error: "iltimos barcha malumotlarni to'liq kiriting nimadir qolib ketdi" })
    }

    try {
        // search SuperAdmin Data
        const userData = await SuperAdmin.findOne({ email })

        if (!userData) {
            return res.status(422).json({ error: "bunday email ro'yhatdan o'tmagan iltimos avval ro'yhatdan o'ting" })
        }
        //SuperAdmin password compaired
        const userPassed = await bcryptjs.compare(password, userData.password)
        if (userPassed) {
            // created SuperAdmin token
            const token = jwt.sign({ _id: userData._id }, JWT_SECRET)

            const { name, email, _id, userAdmin, userCourse, userAvatar } = userData;
            return res.status(200).json({ token, user: { name, email, _id, userAdmin, userCourse, userAvatar } })
        } else {
            return res.status(422).json({ error: "akountga kirib bo'ladi qaytadan urinib ko'ring" })
        }

    } catch (error) {
        return res.status(422).json({ error: "Admin Panelga kirib bo'ladi qaytadan urinib ko'ring" })
    }
})


router.get("/superAdmin/getAllUsers", Auth, async (req, res) => {
    try {
        const Alluser = await User.find()
        if (!Alluser) {
            return res.status(404).json({ msg: "Hechqanday userlar topilmadi" })
        }
        return res.status(200).json(Alluser)
    } catch (error) {
        return res.status(500).json({ error: "Serverda hatolik Userlar topilamdi" })
    }
})


router.get("/superAdmin/getOneUser/:id", Auth, async (req, res) => {
    // user id search user
    const { id } = req.params;
    try {
        const user = await User.findOne({ _id: id })
        if (!user) {
            return res.status(404).json({ msg: "User topilmadi" })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ error: "kechirasiz userni topilmadi Serverda hatolik" })
    }
})

// syperdmin created Admin 
router.put("/superAdmin/createAdmin/:id", Auth, async (req, res) => {
    const { id } = req.params;
    const { userAdmin } = req.body;
    if (!userAdmin) {
        return res.status(422).json({ error: "Iltimos Admin  qo'yilmadi! adminga malumot kiriting true yokiy false" })
    }
    try {
        const userAdmins = await User.findByIdAndUpdate({ _id: id },
            { $set: { userAdmin } })
        return res.status(200).json(userAdmins)
    } catch (error) {
        return res.status(500).json({ error: "Serverda hatolik admin o'rnatilmadi!" })
    }
})

router.put("/superAdmin/updateUser/:id", Auth, async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    try {
        const passHashed = await bcryptjs.hash(password.toString(), 10);
        // user password hashed
        await User.findByIdAndUpdate({ _id: id },
            { $set: { name, email, password: passHashed } })
        return res.status(200).json({ msg: "User malumotlari o'zgartirildi" })
    } catch (error) {
        return res.status(500).json({ error: "Serverda hatolik user malumotlari o'zgarmadi!" })
    }
})

// syperdmin created Admin 
router.delete("/superAdmin/deleteUser/:id", Auth, async (req, res) => {
    const { id } = req.params;
    const user = await User.findOne({ _id: id })
    if (!user) {
        return res.status(404).json({ msg: "user topilmadi" })
    }
    try {
        // user password hashed
        await User.findByIdAndDelete({ _id: id })
        return res.status(200).json({ msg: "User O'chirildi" })
    } catch (error) {
        return res.status(500).json({ error: "Serverda hatolik admin o'rnatilmadi!" })
    }
});


//Super SuperAdmin check email and secretInfo
router.post("/superAdmin/superAdminUpdatePass/acountDataCheck", Auth, async (req, res) => {
    const { email, secretInfo } = req.body;
    if (!email || !secretInfo) {
        return res.status(422).json({ error: "iltimos emailni va hafsizlik uchun secretInformatsiy ham kiriting" })
    }

    try {
        const adminData = await SuperAdmin.findOne({ email })
        if (!adminData) {
            return res.status(422).json({ msg: "Kechirasiz Admin Emailiga Sizning emailingiz tuo'g'ri kelmadi." })
        }
        const compairedSecretInfo = await bcryptjs.compare(secretInfo.toString(), adminData.secretInfo)
        console.log(compairedSecretInfo)
        if (!compairedSecretInfo) {
            return res.status(422).json({ msg: "Kechirasiz Admin hafsizlik so'ziga sizning hafsizlik so'zingiz tuo'g'ri kelmadi." })
        }
        return res.status(200).json({ Checked: "true", adminData })
    } catch (error) {
        return res.status(422).json({ error: "Server hatoligi" })
    }
})

//Super Admin Passsword Update
router.put("/superAdmin/updatePassword", Auth, async (req, res) => {
    const { password, adminId } = req.body;
    if (!adminId) {
        return res.status(401).json({ msg: "Super Admin Id ni kiritishni unitdingiz id topilmadi!" })
    }
    try {
        //SuperAdmin password updated
        const adminPassHashed = await bcryptjs.hash(password.toString(), 10)
        const updateSuperAdmin = await SuperAdmin.findByIdAndUpdate({ _id: adminId },
            { $set: { password: adminPassHashed } })
        return res.status(200).json(updateSuperAdmin)
    } catch (error) {
        return res.status(500).json({ error: "akountga kirib bo'ladi qaytadan urinib ko'ring" })
    }
})


router.post("/superAdmin/updateProfile", Auth, async (req, res) => {
    const { name, email, oldPassword,  newPassword, oldSecretInfo, newSecretInfo, adminId } = req.body;
    const AdminAvatarFile = req.files?.adminAvatar
    if (!adminId) {
        return res.status(401).json({ msg: "Super Admin Id ni kiritishni unitdingiz id topilmadi!" })
    }
    try {
        const file = AdminAvatarFile && uuid.v4() +"-adminAvatar-" + ".jpg"
        AdminAvatarFile?.mv(path.resolve(__dirname, "..", "CourseFile", file))
        const admin = await SuperAdmin.findOne({ _id: adminId })

        const adminpasscompair = await bcryptjs.compare(oldPassword.toString(), admin.password)
        const adminsecretInfocompair = await bcryptjs.compare(oldSecretInfo.toString(), admin.secretInfo)

        if (!adminpasscompair) {
            return res.status(422).json({ msg: "Kechirasiz Admin paroliga sizning parolingiz to'g'ri kelmadi!" })
        }

        if (!adminsecretInfocompair) {
            return res.status(422).json({ error: "Kechirasiz Admin hafsizlik so'ziga sizning hafsizlik so'zingiz tuo'g'ri kelmadi." })
        }

        const passHashed = await bcryptjs.hash(newPassword.toString(), 10)
        const secretInfoHashed = await bcryptjs.hash(newSecretInfo.toString(), 10)

        const SuperAdminUpdated = await SuperAdmin.findByIdAndUpdate({ _id: adminId },
            { $set: { name, email, password: passHashed, secretInfo:secretInfoHashed, adminAvatar:file } })
            
            return res.status(200).json(SuperAdminUpdated)
    } catch (error) {
        console.log(error)
        return res.status(500).json("error")
    }
})


module.exports = router;