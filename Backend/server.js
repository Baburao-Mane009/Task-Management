const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Task = require("./Model/Task.js");
const User = require("./Model/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");


require("dotenv").config();

const cloudinary = require("./Config/cloudnary.js");

const fs = require("fs/promises");
const secret = process.env.JWT_SECRET;
const app = express();






app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["content-type", "Authorization"]
}));
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/TaskManager")
    .then(() => {
        console.log(" mongodb connected sucessfully");
    })
    .catch((error) => {
        console.log("the connection is failed " + error.message);
    })









// // handling error
// app.get("/error",(req,res,next)=>{
//   const error=new Error("something went wrong");
//   next(error);
// })


//  read all tasks
// app.get("/tasks",(req,res)=>{
//    res.status(200).json(tasks);
// })

// // read only particular task
// app.get("/tasks/:id",(req,res)=>{
//     const findTask=tasks.find(el=>el.id===Number(req.params.id));

//       findTask?res.status(200).json(findTask):

//      res.status(404).json({
//         message:"not found"
//      });
//     })



// create task
//  if(typeof(req.body.task)!=="string"){
//         return res.status(400).json({
//             message:"only string is valid"
//         })
//     }
//     if (!req.body.task || !req.body.task.trim()){
//         return res.status(400).json({
//             message:" task is empty"
//         })


//     }

//     else if(!req.body.status  || (req.body.status!=="pending" && req.body.status!=="complete")){
//          return res.status(400).json({
//             message:"status required"
//         })
//     }

// update Task
// app.patch("/tasks/:id", (req,res)=>{
//     const findTask=tasks.find(el=>el.id==Number(req.params.id));
//     if(findTask){
//         const updateTask={
//         ...findTask,
//         status:req.body.status
//      }
//       tasks=tasks.map(el=>el.id===Number(req.params.id)?updateTask:el);
//      res.status(200).json(updateTask);
//     }else{
//         res.status(404).json({
//         message:"not found"
//     })
//     }


// })

// delete task
// app.delete("/tasks/:id",(req,res)=>


// {
//  const findTask=tasks.find(el=>el.id==Number(req.params.id));
// if(findTask){
//          tasks=tasks.filter(el=>el.id!==Number(req.params.id));
//          res.status(204).json();

// }else{
//     res.status(404).json({
//         message:"not found"
//     })
// }

// })





//error handling using try-catch
app.get("/error", (req, res, next) => {
    try {
        throw new Error("Internal server error");
    } catch (error) {
        next(error);
    }

})



const upload = multer({
    dest: "uploads/",
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, true);
        } else {
            cb(new Error("only jbg and png files are allowed"));
        }
    },
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});

//seprate route for cloudanary upload

app.post("/cloud-upload", authMiddleware, (req, res) => {
    console.log("request recieved");
    upload.single("photo")(req, res, async err => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message: "limit exceed"
                })

            }
            return res.status(400).json({
                message: err.message
            })
        }
        if (!req.file) {
            return res.status(400).json({
                message: "upload file"
            })
        }
        try {
            const result = await cloudinary.uploader.upload(req.file.path,
                { folder: "task-manager" })


            const updateProfile = await User.findByIdAndUpdate(req.user.userId, {
                profilePic: result.secure_url
            }, {
                new: true, runValidators: true
            }).select("-password")

            res.status(200).json({
                message: "file uploaded sucessfully",
                imgUrl: result.secure_url,
                user: updateProfile
            })


        } catch (err) {
            return res.status(400).json({
                message: " eroor occured",
                message: err.message
            })
        }
        finally {
            try {
                await fs.unlink(req.file.path);
                console.log("deletestion of temperory is completed");
            } catch (err) {
                console.err(err.message);
            }
        }
    })
})
 

app.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("name email profilePic");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
});

// app.post("/uploads", (req, res) => {
//     upload.single("photo")(req, res, err => {
//        if(err){
//         if(err.code==="LIMIT_FILE_SIZE"){
//            return res.status(400).json({message:"limit excedd"})
//         }
//         return res.status(400).json({
//             message:err.message
//         })
//        }

//     if (!req.file) {
//         return res.status(400).json({
//             message: "please upload file"
//         })
//     }



//     res.status(200).json({
//         message: "file uploaded sucessfully"
//     })



//    })
// })



//creting users

app.post("/User", async (req, res, next) => {

    try {



        if (!req.body.name || !req.body.email || !req.body.password) {
            return res.status(400).json({
                message: "please Enter valid data"
            })
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(req.body.email)) {
            return res.status(400).json({
                message: "please enter valid email"
            })
        }
        const passPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
        if (!passPattern.test(req.body.password)) {
            return res.status(400).json({
                message: "please enter a valid password"
            })
        }

        const password = req.body.password;
        const hash = await bcrypt.hash(password, 10);




        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hash
        })
        newUser.password = undefined;
        res.status(201).json(newUser);


    } catch (error) {
        next(error);
    }

})

//login user
app.post("/login", async (req, res, next) => {
    try {


        if (
            typeof (req.body.email) !== "string" ||
            typeof (req.body.password) !== "string") {
            return res.status(400).json({
                message: "invalid data"
            })
        }

        if (!req.body.email || !req.body.password) {
            return res.status(400).json({
                message: "Please Enter Valid Data"
            })
        }



        if (!req.body.email.trim()) {
            return res.status(400).json({
                message: "empty emai is not allowed"
            })

        }
        if (!req.body.password.trim()) {
            return res.status(400).json({
                message: "password is empty"
            })

        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(req.body.email)) {
            return res.status(400).json({
                message: "please enter a valid email"
            })
        }





        const findUser = await User.findOne({
            email: req.body.email
        })
        if (!findUser) {
            return res.status(401).json({
                message: "not found"
            })



        }
        const password = req.body.password;
        const aunthentic = await bcrypt.compare(password, findUser.password);
        if (aunthentic) {

            const token = jwt.sign(
                { userId: findUser._id },
                secret,
                { expiresIn: "1h" }
            )


            res.status(200).json({
                message: "login sucessfully",
                token: token
            })
        } else {
            return res.status(401).json({
                message: "email and password is inavalid "
            })
        }


    } catch (error) {
        next(error);
    }


})





// read according to mongoose 

app.get("/tasks", authMiddleware, async (req, res, next) => {




    try {
        const filter = {};



        filter.createdBy = req.user.userId;




        if (req.query.status) {
            filter.status = req.query.status
        }
        if (req.query.minPriority) {
            const minPriority = Number(req.query.minPriority);

            if (Number.isNaN(minPriority)) {
                return res.status(400).json({
                    message: "only numbers are valid"
                })
            }

            filter.priority = {
                $gte: minPriority
            }

        }

        if (req.query.excludeComplete === "true") {

            filter.status = {
                $ne: "complete"
            }
        }

        if (req.query.search) {
            filter.task = {
                $regex: req.query.search,
                $options: "i"
            }
        }



        const page = req.query.page === undefined ? 1 : Number(req.query.page);
        let limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

        if (Number.isNaN(page) || page < 1) {
            return res.status(400).json({
                message: "page should be number and greater than 0"
            })
        }

        if (Number.isNaN(limit) || limit < 1) {
            return res.status(400).json({
                message: "limit should be number and greater than 0"
            })
        }


        limit = Math.min(limit, 50);

        const skip = (page - 1) * limit;









        const read = await Task.find(filter)
            .select("task status  priority  createdBy createdAt updatedAt ")
            .sort({ createdAt: -1 })
            .populate("createdBy", "name email")
            .skip(skip)
            .limit(limit);

        const totalTasks = await Task.countDocuments(filter);

        const totalPages = Math.ceil(totalTasks / limit);


        res.status(200).json(
            {
                data: read,
                pagination: {
                    page,
                    limit,
                    totalTasks,
                    totalPages
                }
            });
    }
    catch (error) {
        next(error);
    }
});



// give particular task

app.get("/tasks/:id", authMiddleware, async (req, res, next) => {
    try {
        const oneTask = await Task.findOne({
            _id: req.params.id,
            createdBy: req.user.userId
        });
        if (!oneTask) {
            return res.status(404).json({
                message: "not found"
            })
        }
        res.status(200).json(oneTask);

    } catch (error) {
        next(error);
    }
})


//jwt middleware

function authMiddleware(req, res, next) {
    try {
        // 1. Get Authorization header
        const header = req.headers.authorization;

        // 2. Check if Authorization header exists
        if (!header) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        // 3. Check that it follows: Bearer <token>
        const parts = header.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                message: "Invalid Authorization format"
            });
        }

        // 4. Extract JWT
        const token = parts[1];

        // 5. Verify JWT
        const decoded = jwt.verify(token, secret);

        // 6. Store authenticated user's information
        req.user = decoded;

        // 7. Continue to the protected route
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}


app.post("/tasks", authMiddleware, async (req, res, next) => {




    try {
        const newTask = await Task.create({
            task: req.body.task,
            status: req.body.status,
            priority: req.body.priority,
            createdBy: req.user.userId

        });

        res.status(201).json(newTask);
    }

    catch (error) {
        next(error);
    }


})




//update in database


app.patch("/tasks/:id", authMiddleware, async (req, res, next) => {
    try {


        console.log("Request body:", req.body);
        console.log("Received fields:", Object.keys(req.body));
        const allowedFields = ["task", "status", "priority"];

        if (Object.keys(req.body).some((field) => !allowedFields.includes(field))) {
            return res.status(400).json({
                message: "Invalid field provided"
            });
        }



        if (
            Object.hasOwn(req.body, "task") &&
            (
                typeof req.body.task !== "string" ||
                !req.body.task.trim()
            )
        ) {
            return res.status(400).json({
                message: "Task must be a non-empty string"
            });
        }

        const allowedValue = ["complete", "pending"];

        if (Object.hasOwn(req.body, "status") && (
            typeof (req.body.status) !== "string" ||
            !allowedValue.includes(req.body.status)

        )) {
            return res.status(400).json({
                message: "Invalid status"
            })
        }

        if (Object.hasOwn(req.body, "priority") &&
            (
                typeof (req.body.priority) !== "number" ||
                req.body.priority > 5 || req.body.priority < 1 || !Number.isInteger(req.body.priority)
            )
        ) {
            return res.status(400).json({
                message: "Enter valid Priority"
            })
        }

        const update = {};
        if (req.body.task !== undefined) {
            update.task = req.body.task
        }
        if (req.body.status !== undefined) {
            update.status = req.body.status
        }
        if (req.body.priority !== undefined) {
            update.priority = req.body.priority
        }
        if (Object.keys(update).length === 0) {
            return res.status(400).json({
                message: "At least one field is required for update"
            });
        }


        const updateOne = await Task.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.userId },
            { $set: update },
            { new: true, runValidators: true }
        )

        if (!updateOne) {
            return res.status(404).json({
                message: "Not Found"
            })
        }
        res.status(200).json(updateOne);
    }
    catch (error) {
        next(error);
    }


})


// delete task from db
app.delete("/tasks/:id", authMiddleware, async (req, res, next) => {

    try {
        const deleteOne = await Task.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.userId
        });
        if (!deleteOne) {
            return res.status(404).json({
                message: "Not found"
            })
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }

})


app.use((req, res) => {
    res.status(404).json({
        message: "not found"
    })
})

function errorHandling(err, req, res, next) {
    console.error(err);

    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: "Validation failed"
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Invalid ID or value"
        });
    }

    return res.status(500).json({
        message: "Internal server error"
    });
}

app.use(errorHandling);




app.listen(process.env.PORT, () => {
    console.log(" port is listining sanku");
})





