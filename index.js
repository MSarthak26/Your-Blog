const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const session = require('express-session');


const app=express();
const port=3000;
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    // Add more options as needed
}));

app.use(bodyParser.urlencoded({ extended: true }))
var blog=[];
var blogobj={
    Title:"",
    Content:""
}

var index=-1;
var result
function CreateBlog(Title,Content,username){
    this.Title=Title;
    this.Content=Content;
    this.username=username;
}

function CreateUser(username,password){
    this.username=username;
    this.password=password;
}

app.get("/",(req,res)=>{
    let userdata=[];
    userdata=JSON.parse(fs.readFileSync("user.json","utf-8"))
    res.render("login.ejs",{
        userdata:userdata
    })
})

app.post("/createaccount",(req,res)=>{
    let userdata=[];
    try {
        userdata = JSON.parse(fs.readFileSync('user.json', 'utf8'));
    } catch (err) {
        console.error('Error reading file:', err);
    }
    var username=req.body.username;
    var password=req.body.password;
    let find=false;

    for (let i=0;i<userdata.length;i++){
        if (userdata[i].username===username){
            find=true;
            res.send("username already taken");
            break;
        }
    }
    if (!find){

        const newuser=new CreateUser(username,password);
        userdata.push(newuser);
        let JSONstr=JSON.stringify(userdata);
    
        try {
            fs.writeFileSync('user.json',JSONstr, 'utf8');
            console.log('Data has been written to user.json');
        } catch (err) {
            console.error('Error writing file:', err);
        }
        res.render("login.ejs",{
            userdata:userdata
        })
        res.redirect("/",{userdata})
    }
    }
)


app.get("/register",(req,res)=>{
    res.render("register.ejs")
})

app.post("/home",(req,res)=>{
    var username=req.body.username;
    var password=req.body.password;
   
    let userdata=[]
    try {
        userdata = JSON.parse(fs.readFileSync('user.json', 'utf8'));
    } catch (err) {
        console.error('Error reading file:', err);
    }

    let find=false;
    for (let i = 0; i < userdata.length; i++) {
        // Check if the current user's username matches the search query
        if (userdata[i].username === username && userdata[i].password === password) {
            req.session.username=req.body["username"];
            find=true;
            console.log(req.session.username);
            res.render("index.ejs",{yourblog:blog,username:req.session.username});
            return;

        }
    }
    if (!find){
        res.send("incorrect id or password")
    }
    
}

)

app.post("/create",(req,res)=>{
    const uname=req.session.username;
    console.log(uname);
    var entry=new CreateBlog(`${req.body["title"]}`,`${req.body["blogcontent"]}`,`${uname}`)
    let bloglist=[];
    try{
        bloglist=JSON.parse(fs.readFileSync("blogs.json",'utf-8'));
        bloglist.push(entry);
    }
    catch(error){
        console.log("error in reading file");
    }

    try{
        let string=JSON.stringify(bloglist);
        fs.writeFileSync("blogs.json",string,'utf-8');
        console.log("successfully written");
    }
    catch(error){
        console.log("error");
   }
    

    // blog.push(entry)
    res.redirect("/homeafter")
})

app.get("/homeafter",(req,res)=>{
    let bloglist=[];
    try{
        bloglist=JSON.parse(fs.readFileSync("blogs.json",'utf-8'));
        console.log("success")
    }
    catch(error){
        console.log(error)
    }

    res.render("index.ejs",{yourblog:bloglist,username:req.session.username})
})

app.get("/view",(req,res)=>{
    let bloglist=[];
    try{
        bloglist=JSON.parse(fs.readFileSync("blogs.json",'utf-8'));
        console.log("success")
    }
    catch(error){
        console.log(error)
    }
    res.render("view.ejs",{yourblog:bloglist })
})

app.post("/edit",(req,res)=>{
    let bloglist=[];
    try{
        bloglist=JSON.parse(fs.readFileSync("blogs.json",'utf-8'));
        console.log("success")
    }
    catch(error){
        console.log(error)
    }
    if(bloglist.length > 0){
        
        result = bloglist.find(({ Title }) => Title === req.body["id"]);
        index=bloglist.indexOf(result)
        console.log(index)
        if (result) {
            // Pass the result and its index to the edit page
            res.render("edit.ejs", { yourblog: bloglist, index:index});
        } else {
            res.render("edit.ejs", { yourblog: bloglist });
        }
    }
    else {
        res.render("edit.ejs", { yourblog: bloglist });
    }
});

app.post("/verify",(req,res)=>{
    let bloglist=[];
    try{
        bloglist=JSON.parse(fs.readFileSync("blogs.json",'utf-8'));
        console.log("success")
    }
    catch(error){
        console.log(error)
    }
    bloglist[index].Title=req.body["id"]
    bloglist[index].Content=req.body["editedBlog"]
    let string=JSON.stringify(bloglist);
    try{
        fs.writeFileSync("blogs.json",string,'utf-8');
    }
    catch(error){
        console.log(error)
    }
    res.redirect("/homeafter")
})

app.post("/delete",(req,res)=>{
    let bloglist=[];
    try{
        bloglist=JSON.parse(fs.readFileSync("blogs.json",'utf-8'));
        console.log("success")
    }
    catch(error){
        console.log(error)
    }
    const dresult = bloglist.find(({ Title }) => Title === req.body["id"]);
    const dindex=bloglist.indexOf(dresult);

    bloglist.splice(dindex,1);
    let string=JSON.stringify(bloglist);
    try{
        fs.writeFileSync("blogs.json",string,'utf-8');
    }
    catch(error){
        console.log(error)
    }
    res.redirect("/homeafter")
})

app.listen(port,()=>{
    console.log(`Server on port ${port}`);
})
