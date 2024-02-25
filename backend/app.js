require("dotenv").config();
const express = require("express");
const app = express();
const port =process.env.PORT;
const { IgApiClient } = require("instagram-private-api");
const mongoose = require("mongoose");
const session = require("express-session");
const {instagramIdToUrlSegment, urlSegmentToInstagramId} = require('instagram-id-to-url-segment');
const jwt = require("jsonwebtoken");
const cors = require("cors");
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true in production with HTTPS
  })
);
app.use(cors());
const ig = new IgApiClient();
// view engine setup
app.set("view engine", "ejs");
//body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//session
app.use(express.static("public"));
//config mongoose
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("connected to db");
})
const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
})
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

//model
const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", adminSchema);
const adminAuth = (req, res, next) => {
  // Check if the user is authenticated jwt
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
}

app.post('/api/admin/login', async (req, res) => {
  try {
    const user = await Admin.findOne({ username: req.body.username });
    if (user && user.password === req.body.password) {
      const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '10d' });
      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    
  }
})
// app.post('/api/admin/register', async (req, res) => {
//   try {
//     const user = await Admin.findOne({ username: req.body.username });
//     if (user) {
//       res.status(409).json({ error: 'Username already exists' });
//     }

//     const newUser = new Admin({
//       username: req.body.username,
//       password: req.body.password,
//     });
//     await newUser.save();
//     res.status(200).json({ message: 'User created successfully' });
//   }
//   catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
app.get('/api/admin/protected',adminAuth, (req, res) => {
  res.status(200).json({ message: 'Protected route accessed successfully' });
})
app.post('/api/admin/add-user', adminAuth,async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      res.status(409).json({ error: 'Username already exists' });
    }

    const newUser = new User({
      username: req.body.username,
      password: req.body.password,
    });
    await newUser.save();
    res.status(200).json({ message: 'User created successfully' });

  }catch(error){
    res.status(500).json({ error: error.message });
  }
})
//get single user
app.get("/api/admin/user/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})
// app.post("/login", async (req, res) => {
//   try {
//     // Assuming ig is an Instagram private API instance
//     ig.state.generateDevice(req.body.username);
//     const result = await ig.account.login(req.body.username, req.body.password);
    
//     req.session.user = result;
//     console.log(result);

//     const user = await User.findOne({ username: req.body.username });

//     if (user) {
//       res.cookie("username", result.username);
//       return res.redirect("/");
//     }

//     // If the user does not exist, create a new user
//     await User.create({
//       username: req.body.username,
//       password: req.body.password,
//     });


//   } catch (error) {
//     res.status(401).json({ error: error.message });
//   }
// });
app.get("/", (req, res) => {
  res.status(200).send("Not Allowed To Access")
});
app.get("/api/admin/users", adminAuth, async (req, res) => {
  try {
    const { page = 1, perPage = 10, search = "" } = req.query;
    const skip = (page - 1) * perPage;
    const searchQuery = search.trim();

    let query = {};
    if (searchQuery !== "") {
      const searchRegex = new RegExp(searchQuery, 'i');
      query = { username: { $regex: searchRegex } };
    }

    const users = await User.find(query)
      .skip(skip)
      .limit(Number(perPage));

    const totalUsersCount = await User.countDocuments(query);

    res.status(200).json({
      data: users,
      currentPage: page,
      totalPages: Math.ceil(totalUsersCount / perPage),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/api/admin/update-user/:id", adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, password } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update username if provided
    if (username) {
      user.username = username;
    }

    // Update password if provided
    if (password) {
      user.password = password; // You should hash the password before saving in a production environment
    }

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/admin/delete-user/:id", adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID and delete
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/send-followers", adminAuth, async (req, res) => {
  try {
    const users = await User.find();

    for (const user of users) {
      try {
        ig.state.generateDevice(user.username);
        const loggedInUser = await ig.account.login(
          user.username,
          user.password
        );

        const friendship = await ig.search.users(req.body.username);

        if (friendship.length > 0) {
          const userId = friendship[0].pk;
          await ig.friendship.create(userId);
        }
      } catch (error) {
        console.error(`Error for user ${user.username}: ${error.message}`);
        // Continue with the next user even if an error occurs
        continue;
      }
    }

    res.status(200).json({ message: "Followers sent successfully" });
  } catch (error) {
    res.status(401).render("login", { error: error.message });
  }
});

app.post("/api/admin/add-like",adminAuth, async (req, res) => {
  try {
    const users = await User.find();
    // Iterate over each user
    for (const user of users) {
      ig.state.generateDevice(user.username); // Use user-specific device info
      
      // Try to log in with the current user's credentials
      try {
        const loggedInUser = await ig.account.login(user.username, user.password);

        // If login is successful, proceed with the like action
        const code = extractMediaIdFromUrl(req.body.url); // Assuming URL is sent in the request body
        const mediaId = urlSegmentToInstagramId(code);

        const result = await ig.media.like({
          mediaId: mediaId,
          moduleInfo: {
            module_name: 'profile',
            user_id: loggedInUser.pk,
            username: loggedInUser.username,
          },
        });

        console.log(`Liked by user: ${user.username}`);
        console.log(result);

   

      } catch (loginError) {
        // Handle login errors if needed (e.g., continue to the next user)
        console.log(`Login failed for user: ${user.username}`);
        console.error(loginError);
        continue; // Skip to the next user if login fails
      }
    }

    res.status(200).json({ message: "Likes sent successfully" });

  } catch (error) {
    // Handle other errors appropriately
    res.status(500).render("error", { error: error.message });
  }
});

function extractMediaIdFromUrl(url) {
  // The URL pattern typically looks like this: https://www.instagram.com/p/{media-id}/
  const match = url.match(/\/p\/([^/]+)/);
  return match ? match[1] : null;
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

