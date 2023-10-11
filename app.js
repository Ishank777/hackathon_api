require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// 
const sessions = {}; // Store session tokens and user information here.

// ishank
const Post = require('./server/models/post');
const Like = require('./server/models/like');
const { ObjectID } = require('mongodb');

const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routeHelpers');

const app = express();
const PORT = process.env.PORT || 5000;

var http = require('http').createServer(app);
var { Server } = require('socket.io');
var io = new Server(http,{});
  
// Connect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  //cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
}));

app.use(express.static('public'));

// Templating Engine
app.use(expressLayout);
app.set('layout', './layouts/main');

app.set('view engine', 'ejs');


app.locals.isActiveRoute = isActiveRoute; 


app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));
app.use('/', require('./server/routes/master'));


// ishank
io.on("connection",function(socket){
  console.log('User Connected');


  // await Post.updateOne(req.params.id, {
  //   views: locals.views+1,
  // });
  socket.on("like", async function(data){
      await Like.updateOne(req.params.id, 
      [
        {
            post_id:data.post_id,
            user_id:data.user_id
        }, {
            type:1
        },
        {
            upsert: true
        }
      ]);

      const likes = await Like.find({ "post_id":data.post_id,type:1 }).count();
      const dislikes = await Like.find({ "post_id":data.post_id,type:0 }).count();

      io.emit("like_dislike",{
          post_id:data.post_id,
          likes:likes,
          dislikes:dislikes
      });
  });

  socket.on("dislike", async function(data){
      await Like.updateOne({
          post_id:data.post_id,
          user_id:data.user_id
      }, {
          type:0
      },
      {
          upsert: true
      });

      const likes = await Like.find({ "post_id":data.post_id,type:1 }).count();
      const dislikes = await Like.find({ "post_id":data.post_id,type:0 }).count();

      io.emit("like_dislike",{
          post_id:data.post_id,
          likes:likes,
          dislikes:dislikes
      });
  });
});



app.listen(PORT, ()=> {
  console.log(`App listening on port ${PORT}`);
});