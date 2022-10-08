const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    BlogTopic: {
        type: String,
        required: true
    },
    Content1Heading: {
        type: String,
        required: true
    },
    BlogContent: {
        type: String,
        required: true
    },
    Content2Heading: {
        type: String,
        required: true
    },
    BlogContent2: {
        type: String,
        required: true
    },
    Content3Heading :  {
        type : String,
        required : true
    },
    BlogContent3 : {
        type : String,
        required : true
    },
    Content4Heading :  {
        type : String,
        required : false
    },
    BlogContent4 : {
        type : String,
        required : false
    },
    BlogPostDate: {
        type: Date,
        required: true,
        default: Date
    },
    AuthorName : {
        type : String,
        required : true
    },
    AuthorEmail : {
        type : String,
        required : true
    }

})

const Blog = mongoose.model("Blog", BlogSchema);
module.exports = Blog;