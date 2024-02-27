import express from "express"
import bodyParser from "body-parser"

const app=express();
const port=3000;
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: true }))
var blog=[];
var blogobj={
    Title:"",
    Content:""
}

var index=-1;
var result
function CreateBlog(Title,Content){
    this.Title=Title;
    this.Content=Content;
}

app.get("/",(req,res)=>{
    res.render("index.ejs",{yourblog:blog})
})

app.post("/create",(req,res)=>{
    var entry=new CreateBlog(`${req.body["title"]}`,`${req.body["blogcontent"]}`)
    blog.push(entry)
    res.redirect("/")
})

app.get("/view",(req,res)=>{
    res.render("view.ejs",{yourblog:blog })
})

app.post("/edit",(req,res)=>{
    if(blog.length > 0){
        
        result = blog.find(({ Title }) => Title === req.body["id"]);
        index=blog.indexOf(result)
        console.log(index)
        if (result) {
            // Pass the result and its index to the edit page
            res.render("edit.ejs", { yourblog: blog, index:`${index}`});
        } else {
            res.render("edit.ejs", { yourblog: blog });
        }
    }
    else {
        res.render("edit.ejs", { yourblog: blog });
    }
});

app.post("/verify",(req,res)=>{
    blog[index].Title=req.body["id"]
    blog[index].Content=req.body["editedBlog"]
    res.redirect("/")
})

app.post("/delete",(req,res)=>{
    const dresult = blog.find(({ Title }) => Title === req.body["id"]);
    const dindex=blog.indexOf(dresult);

    blog.splice(dindex,1);
    res.redirect("/")
})

app.listen(port,()=>{
    console.log(`Server on port ${port}`);
})
