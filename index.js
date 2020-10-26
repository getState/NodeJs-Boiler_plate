const express = require('express')
const app = express()
const port = 3000

const bodyParser = require('body-parser');
const {User} = require("./models/User");

//데이터를 분석해서 가져온다.
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const config = require('./config/key');
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser : true, useUnifiedTopology : true, useCreateIndex : true, useFindAndModify:false
}).then(()=> console.log('MongoDB connected...'))
.catch((err)=> console.log(err))

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/register', (req, res) => {
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
