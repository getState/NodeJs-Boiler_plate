const express = require('express')
const app = express()
const port = 5000

const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const {User} = require("./models/User");
const {auth} = require("./middleware/auth");
//데이터를 분석해서 가져온다.
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

const config = require('./config/key');
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser : true, useUnifiedTopology : true, useCreateIndex : true, useFindAndModify:false
}).then(()=> console.log('MongoDB connected...'))
.catch((err)=> console.log(err))

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/api/users/register', (req, res) => {
    //회원가입 할때 필요한 정보들을 client에서 가져오면 그것들을 데이터베이스에 넣는다.
    const user = new User(req.body);
    user.save((err, userInfo)=>{
        if(err){
            return res.json({success:false, err})
        }
        return res.status(200).json({
            success:true
        });
    }); //mongoDB에 저장
})

app.post('/api/users/login', (req, res) => {
    //1.요청된 이메일이 데이터베이스에 있는지 찾는다.
    User.findOne({email: req.body.email}, (err, user) =>{
        if(!user){
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당되는 유저가 없습니다."
            })
        }
        //2. 비밀번호가 같은지 확인한다.
        user.comparePassword(req.body.password, (err, isMatch) =>{
            if(!isMatch){
                return res.json({loginSuccess:false, message:"비밀번호가 틀렸습니다."});
            }

            //3. 비밀번호까지 맞다면 유저를 위한 토큰을 생성한다.
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);

                // 토큰을 저장한다. 어디에?  쿠키, 로컬스토리지에 
                // 여기선 쿠키에
                res.cookie("x_auth", user.token)
                .status(200)
                .json({loginSuccess:true, userId: user._id })
            })
        })
    
    })
})
//중간에 auth를 미들웨어라고 한다.
app.get('api/users/auth', auth, (req, res) =>{
    //auth 를 통과한 다음 할일
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role===0? false:true, //role 1은 admin
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role:req.user.role,
        image:req.user.image,
    })
})

app.get('/api/users/logout', auth, (req, res) =>{
    //findOneAndUpdate()는 해당 user를 찾아서 update해준다.
    User.findOneAndUpdate({_id:req.user._id}, {token:""}, (err, user)=>{
        if(err) return res.json({success:false, err});
        return res.status(200).send({
            success:true
        })
    })
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
