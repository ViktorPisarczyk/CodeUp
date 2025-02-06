const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());


// Connect to MongoDB
mongoose.connect('***REMOVED***/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const userSchema = mongoose.model('user', userSchema);

// Login route
app.post('/login', async (req, res) => {
    try {
        const user = await userSchema.findOne({ email: req.body.email });
        if (!user) return res.status(400).send('User not found');

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) return res.status(400).send('Invalid credentials');

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).send('Error logging in');    
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
