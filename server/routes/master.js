const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/User');
const bcrypt = require('bcrypt');           //password related
const jwt = require('jsonwebtoken');          //password related

const adminLayout = '../views/layouts/master';
const jwtSecret = process.env.JWT_SECRET;


// Helper function to generate a random session token
function generateSessionToken() {
  return Math.random().toString(36).slice(2);
}

/**
 * 
 * Check Login
*/
const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;

  if(!token || !sessions[token]) {
    return res.status(401).json( { message: 'Unauthorized'} );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if(sessions[token]) {
      decoded = jwt.verify(sessions[token], jwtSecret);
    }
    req.userId = decoded.userId;
    next();
  } catch(error) {
    res.status(401).json( { message: 'Unauthorized'} );
  }
}


/**
 * GET /
 * Admin - Login Page
*/
router.get('/master', async (req, res) => {
  try {
    const locals = {
      title: "Master",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    res.render('master/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});


/**
 * POST /
 * Admin - Check Login
*/
router.post('/master', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne( { username } );

    if(!user) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const token = jwt.sign({ userId: user._id}, jwtSecret );
    res.cookie('token', token, { httpOnly: true });

    res.cookie('username', username);//for saving username
    res.redirect('/dashboard-m');

  } catch (error) {
    console.log(error);
  }
});


/**
 * GET /
 * Admin Dashboard
*/
router.get('/dashboard-m', authMiddleware, async (req, res) => {
  try {
    const locals = {
      username: req.cookies.username,
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find();
    res.render('master/dashboard-m', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});


/**
 * GET /
 * Admin - Create New Post
*/
// router.get('/add-post-m', authMiddleware, async (req, res) => {
//   try {
//     const locals = {
//       title: 'Add Post',
//       description: 'Simple Blog created with NodeJs, Express & MongoDb.'
//     }

//     const data = await Post.find();
//     res.render('master/add-post-m', {
//       locals,
//       layout: adminLayout
//     });

//   } catch (error) {
//     console.log(error);
//   }

// });


// /**
//  * POST /
//  * Admin - Create New Post
// */
// router.post('/add-post-m', authMiddleware, async (req, res) => {
//   try {
//     try {
//       const username= req.cookies.username;
//       const newPost = new Post({
//         title: req.body.title,
//         body: req.body.body,   
//         Username: username,
//       });

//       await Post.create(newPost);
//       res.redirect('/dashboard-m');
//     } catch (error) {
//       console.log(error);
//     }

//   } catch (error) {
//     console.log(error);
//   }
// });


/**
 * GET /
 * Admin - Create New Post
*/
// router.get('/approve-post-m/:id', authMiddleware, async (req, res) => {
//   try {

//     const locals = {
//       title: "Edit Post",
//       description: "Free NodeJs User Management System",
//     };

//     // const data = await Post.findOne({ _id: req.params.id });

//     // res.render('master/approve-post-m', {
//     //   locals,
//     //   data,
//     //   layout: adminLayout
//     // })

//   } catch (error) {
//     console.log(error);
//   }

// });


/**
 * PUT /
 * Admin - Create New Post
*/
// router.put('/edit-post-m/:id', authMiddleware, async (req, res) => {
//   try {

//     await Post.findByIdAndUpdate(req.params.id, {
//       title: req.body.title,
//       body: req.body.body,
//       updatedAt: Date.now(),
//       Approved: "yes"
//     });

//     res.redirect(`/edit-post-m/${req.params.id}`);

//   } catch (error) {
//     console.log(error);
//   }

// });

// router.get('/approve-post-m/:id', authMiddleware, async (req, res) => {
//   try{
//   const request = require('request');
//   const axios = require('axios');
//   const options = {
//     method: 'POST',
//     url: 'https://chatgpt-api8.p.rapidapi.com/',
//     headers: {
//       'content-type': 'application/json',
//       'X-RapidAPI-Key': '903ea57a35msh5cb879c48a015c5p18d302jsneb13607cffbb',
//       'X-RapidAPI-Host': 'chatgpt-api8.p.rapidapi.com'
//     },
//     body: [
//       {
//         content: Post.body + "summarize this",
//         role: 'user'
//       }
//     ],
//     json: true
//   };
  
//   request(options, function (error, response, body) {
//     if (error) throw new Error(error);
  
//     console.log(body);
//   });

// try {
//   const response = await axios.request(options);
//   console.log(response.data);
//   await Post.findByIdAndUpdate(req.params.id, {
//     //Summary: response.data,
//     Approved: "yes"
//   });
// } catch (error) {
//   console.error(error);
// }


// // await Post.findByIdAndUpdate(req.params.id, {
// //   Summary: response.data,
// //   Approved: "yes"
// // });

// res.redirect(`/dashboard-m`);

// } catch (error) {
// console.log(error);
// }

// });



    router.get('/approve-post-m/:id', authMiddleware, async (req, res) => {
      try{
      await Post.findByIdAndUpdate(req.params.id, {
        //Summary: response.data,
        Approved: "yes"});
    // await Post.findByIdAndUpdate(req.params.id, {
    //   Summary: response.data,
    //   Approved: "yes"
    // });

    res.redirect(`/dashboard-m`);

  } catch (error) {
    console.log(error);
  }

});


// router.post('/admin', async (req, res) => {
//   try {
//     const { username, password } = req.body;
    
//     if(req.body.username === 'admin' && req.body.password === 'password') {
//       res.send('You are logged in.')
//     } else {
//       res.send('Wrong username or password');
//     }

//   } catch (error) {
//     console.log(error);
//   }
// });


/**
 * POST /
 * Admin - Register
*/
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password:hashedPassword });
      res.status(201).json({ message: 'User Created', user });
    } catch (error) {
      if(error.code === 11000) {
        res.status(409).json({ message: 'User already in use'});
      }
      res.status(500).json({ message: 'Internal server error'})
    }

  } catch (error) {
    console.log(error);
  }
});


/**
 * DELETE /
 * Admin - Delete Post
*/
router.delete('/delete-post-m/:id', authMiddleware, async (req, res) => {

  try {
    await Post.deleteOne( { _id: req.params.id } );
    res.redirect('/dashboard-m');
  } catch (error) {
    console.log(error);
  }

});


/**
 * GET /
 * Admin Logout
*/
router.get('/logout', (req, res) => {
  const sessionToken = req.cookies.sessionToken;
  if (sessionToken) {
    delete sessions[sessionToken];
    res.clearCookie('sessionToken');
  }
  // res.clearCookie('token');
  //res.json({ message: 'Logout successful.'});
  res.redirect('/');
});


module.exports = router;