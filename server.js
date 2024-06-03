const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

const fs = require('fs');



const url = process.env.MONGO_URL; 
const dbName = 'INCOGNITODB'; 

const client = new MongoClient(url, { useUnifiedTopology: true });


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

app.post('/signup', async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection('users');

    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10), // Hash the password
    };

    // Check if the email is already registered
    const existingUser = await collection.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const result = await collection.insertOne(userData);
    // res.status(200).json({ message: 'Signup successful' });
    res.redirect('SignUp_Login/signup_login.html');
    
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'Error in signup' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection('users');

    const email = req.body.email;
    const password = req.body.password;

    // Find the user by email
    const user = await collection.findOne({ email: email });

    // Verify the password using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    if (user) {
      // Read the main.html file
      fs.readFile('public/main/main.html', 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading main.html:', err);
          res.status(500).send('Error reading main.html');
        } else {
          const modifiedHtml = data.replace(/{{user_name}}/g, user.name);
          res.send(modifiedHtml);
        }
      });
    } else {
      // Handle the case where the user's data is not found
      res.status(404).send('User not found');
    }

    // Login successful
    // res.status(200).json({ message: 'Login successful', user: user });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Error in login' });
  }
});


app.get('/logout', (req, res) => {
    res.redirect('SignUp_Login/signup_login.html'); // Redirect to the  login page
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectToMongoDB();
});
