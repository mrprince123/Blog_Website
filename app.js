require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const BlogModel = require('./models/Blog');
const ContactModel = require("./models/Contact");
const ejs = require('ejs');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const session = require('express-session');
const cookieSession = require('cookie-session');
const url = process.env.URL;
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


app.set('trust proxy', 1);
// app.set('trust proxy', 1);

app.use(session({
    cookie: {
        secure: true,
        maxAge: 60000
    },
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: false
}))

app.use(passport.initialize());
app.use(passport.session());


// This is for the Database.
mongoose.connect(url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Database is successfully connected");
}).catch((err) => {
    console.log("This is the erro  : " + err);
})

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);

const User = new mongoose.model("User", UserSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://blog-website.up.railway.app/auth/google/main",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

// This is global variable for logout. 
app.use(function (req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});


//  Now I use use the router from here. 
app.get('/', function (req, res) {
    res.render('home');
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/main',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/main');
    });

app.get('/register', function (req, res) {
    res.render('register');
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.get('/main', function (req, res) {
    if (req.isAuthenticated()) {
        res.render("main");
    } else {
        res.redirect("/login");
    }
});

app.get("/about", function (req, res) {
    res.render("about");
})

// Blog Code
app.post("/insert", async function (req, res) {
    const BlogTopic = req.body.BlogTopic
    const Content1Heading = req.body.Content1Heading
    const BlogContent = req.body.BlogContent
    const Content2Heading = req.body.Content2Heading
    const BlogContent2 = req.body.BlogContent2
    const Content3Heading = req.body.Content3Heading
    const BlogContent3 = req.body.BlogContent3
    const Content4Heading = req.body.Content4Heading
    const BlogContent4 = req.body.BlogContent4
    const BlogPostDate = req.body.BlogPostDate
    const AuthorName = req.body.AuthorName
    const AuthorEmail = req.body.AuthorEmail

    const b1 = new BlogModel({
        BlogTopic: BlogTopic,
        Content1Heading: Content1Heading,
        BlogContent: BlogContent,
        Content2Heading: Content2Heading,
        BlogContent2: BlogContent2,
        Content3Heading: Content3Heading,
        BlogContent3: BlogContent3,
        Content4Heading: Content4Heading,
        BlogContent4: BlogContent4,
        BlogPostDate: BlogPostDate,
        AuthorName: AuthorName,
        AuthorEmail: AuthorEmail
    });

    try {
        await b1.save();
        // res.send("Data is inserted");
        res.redirect("blog");
    } catch (error) {
        res.send("This is the Error : " + error);
    }

});

app.get("/blog", function (req, res) {
    BlogModel.find({}, function (err, result) {
        if (err) {
            res.send("This is the Error : " + err)
        } else {
            // res.send(result);
            res.render("blog", { blogsData: result });
        }
    });
});

app.get("/contact", function (req, res) {
    res.render('contact');
})

app.post("/contact", async function (req, res) {
    const Name = req.body.Name
    const Email = req.body.Email
    const Message = req.body.Message

    const c1 = new ContactModel({
        Name: Name,
        Email: Email,
        Message: Message
    });

    try {
        await c1.save();
        res.redirect('/thanks');
        // res.send("Thanks For Contacting Us.");
    } catch (error) {
        res.send("This is the Error : " + error);
    }
});

app.get('/thanks', function (req, res) {
    res.render('thanks');
});


app.post("/register", function (req, res) {

    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/main");
            });
        }
    });

});

app.post("/login", function (req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/main");
            });
        }
    });
});


app.get("/logout", function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                res.redirect('/');
            }
        })
    }
});


app.get('*/*', function (req, res) {
    res.render('error');
});


const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Server is running on the port ${port}`);
});
