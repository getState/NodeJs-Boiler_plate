const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name : {
        type : String,
        maxlength: 50
    },
    email:{
        type: String,
        trim: true,
        unique: 1,  //겹치는게 없음
    },
    lastname: {
        type: String,
        maxlength:50,
    },
    role:{
        type: Number,
        default: 0,
    },
    image : String,
    token:{
        type: String
    },
    tokenExp:{
        //토큰의 사용기한
        type: Number,
    }
})
const User = mongoose.model('User', userSchema);

module.exports = {User}