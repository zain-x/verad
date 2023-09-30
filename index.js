const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.json());

// Placeholder variables for storing user data
const registeredUsers = [];
const loggedInUsers = [];

// Route to handle user registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
  
    // Check if the user already exists
    const existingUser = registeredUsers.find(
      (user) => user.username === username || user.email === email
    );
  
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
  
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user object with hashed password
      const newUser = { username, email, password: hashedPassword };
      registeredUsers.push(newUser);
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error occurred during registration' });
    }
  });
  

// Route to handle user sign-in
app.post('/signin', (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists and the password is correct
  const user = registeredUsers.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Add the user to the logged-in users
  loggedInUsers.push(user);

  res.json({ message: 'User signed in successfully' });
});

let appVersion = '1.0.0'; // Set the initial app version

// Route to get and update the app version
app.route('/version')
  .get((req, res) => {
    res.json({ version: appVersion });
  })
  .put((req, res) => {
    const { version } = req.body;

    // Validate the version value
    if (!version) {
      return res.status(400).json({ error: 'Invalid version' });
    }

    // Update the app version
    appVersion = version;

    res.json({ message: 'App version updated successfully', version: appVersion });
  });


// Route to update user details
app.put('/users/:username', (req, res) => {
    const { username } = req.params;
    const { email, password } = req.body;
  
    // Find the index of the user in the array
    const userIndex = registeredUsers.findIndex(user => user.username === username);
  
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    // Check if the updated email is already associated with another user
    const isEmailTaken = registeredUsers.some(user => user.email === email && user.username !== username);
    if (isEmailTaken) {
      return res.status(409).json({ error: 'Email is already taken by another user' });
    }
  
    // Update the user details
    registeredUsers[userIndex].email = email || registeredUsers[userIndex].email;
    registeredUsers[userIndex].password = password || registeredUsers[userIndex].password;
  
    res.json({ message: 'User updated successfully', user: registeredUsers[userIndex] });
  });
  
  
// Route to delete a user
app.delete('/users/:username', (req, res) => {
    const { username } = req.params;
  
    // Find the user index in the registeredUsers array
    const userIndex = registeredUsers.findIndex(user => user.username === username);
  
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    // Remove the user from the registeredUsers array
    registeredUsers.splice(userIndex, 1);
  
    res.json({ message: 'User deleted successfully' });
  });

app.get('/users', (req, res) => {
    res.json(registeredUsers);
  });

// app.get('/version', (req, res) => {
//     const version = '1.0.0'; // Replace with your actual app version
  
//     res.json({ version });
//   });
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
