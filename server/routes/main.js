const express = require('express');
const router =express.Router();
// ishank
const Post = require('../models/post');
const Like = require('../models/like');
//routes

// ishank
const app = express();
var http = require('http').createServer(app);
var { Server } = require('socket.io');
var io = new Server(http,{});

router.get('',async (req,res) => {                   //uses the router instead of the app

   //renders the index pagein layouts

try {

    const locals = {
        title: "Node Blog",
        description: "simple blog"
    }

    //res.render('index', {locals});

    let perPage = 10;
    let page = req.query.page||1;        //if page number not present in web search query, then default is 1

    const data = await Post.aggregate([{ $sort: {createdAt: -1}}])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();


    const count = await Post.count();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count/perPage);

    //const data= await Post.find();
    res.render('index', {locals,
        data,
        current: page,
        nextPage: hasNextPage ? nextpage : null
    });
} catch (error) {
    console.log(error);
}

});




// function insertPostData (){
//     Post.insertMany([
//         {
//             title: "Building a block",
//             body: "This is the body text"
//         },
//     ])
// }

// insertPostData();






// ishank
router.get('/post/:id', async (req, res) => {
    try {

        const likes = await Like.find({ "post_id":req.params.id,type:1 }).count();
        const dislikes = await Like.find({ "post_id":req.params.id,type:0 }).count();

        let slug = req.params.id; // Corrected variable name

        const data = await Post.findById({ _id: slug }); // Corrected variable name

        const locals = {
            title: data.title,
            description: "simple blog post",
        }

        res.render('post', { locals, data, likes:likes,dislikes:dislikes }); // Corrected object structure
    } catch (error) {
        console.log(error);
    }
})


router.get('/post/:id', async (req, res) => {
    try {

        let slug = req.params.id; // Corrected variable name

        const data = await Post.findById({ _id: slug }); // Corrected variable name

        const locals = {
            title: data.title,
            description: "simple blog post",
            views: data.views,
        }

        await Post.findByIdAndUpdate(req.params.id, {
            views: locals.views+1,
          });


        data.views+=1;
        res.render('post', { locals, data }); // Corrected object structure
    } catch (error) {
        console.log(error);
    }
})


router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "search",
            description: "simple blog"
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"");

        const data= await Post.find({
            $or: [
                {title: { $regex: new RegExp(searchNoSpecialChar, 'i')}},
                {body: { $regex: new RegExp(this.searchNoSpecialChar,'i')}}
            ]
        });
        console.log(searchTerm);

        res.render('search',{
            data,
            locals
        })
    } catch (error) {
        console.log(error);
    }
});


router.get('/contact', (req, res) => {
    // Handle the GET request for /contact here
    res.render('contact');
});

router.get('/about', (req, res) => {
    // Handle the GET request for /contact here
    res.render('about');
});


// ishank
io.on("connection",function(socket){
    console.log('User Connected');

    socket.on("new_post",function(formData){
        console.log(formData);
        socket.broadcast.emit("new_post", formData);
    });

    socket.on("new_comment",function(comment){
        io.emit("new_comment",comment);
    });

    socket.on("new_reply",function(reply){
        io.emit("new_reply",reply);
    });

    socket.on("delete_post",function(postId){
        socket.broadcast.emit("delete_post",postId);
    });

    socket.on('increment_page_view', async function(post_id){
        var data = await Post.findOneAndUpdate({_id:ObjectID(post_id)}, {
            $inc: { views: 1 }
        },{
            new: true,
        });
        socket.broadcast.emit("updated_views",data);
    });

    socket.on("like", async function(data){
        await Like.updateOne({
            post_id:data.post_id,
            user_id:data.user_id
        }, {
            type:1
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

module.exports = router;