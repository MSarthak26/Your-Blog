import express from "express"
import bodyParser from "body-parser"
import fs from "fs"

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
            // Return the user object if found
            find=true;
            res.render("index.ejs",{yourblog:blog});

        }
    }
    if (!find){
        res.send("incorrect id or password")
    }
    
}

)

app.get("/home",(req,res)=>{
    res.render("index.ejs",{yourblog:blog})
})

app.post("/create",(req,res)=>{
    var entry=new CreateBlog(`${req.body["title"]}`,`${req.body["blogcontent"]}`)
    blog.push(entry)
    res.redirect("/home")
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
            res.render("edit.ejs", { yourblog: blog, index:index});
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
    res.redirect("/home")
})

app.listen(port,()=>{
    console.log(`Server on port ${port}`);
})
