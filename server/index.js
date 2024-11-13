import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // Import cors

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Connect to MongoDB
mongoose.connect('mongodb+srv://vikas123:SpGBtqkOpLf7Sb2v@cluster0.zaohd.mongodb.net/Quiz?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
    console.log("Database Connected");
    // insertInitialData(); // Insert initial data on server start

})
.catch((error) => {
    console.error("Database connection error:", error);
});

// Define the quiz schema
const quizSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple', 'boolean'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  correct_answer: {
    type: String,
    required: true
  },
  incorrect_answers: {
    type: [String],
    validate: {
      validator: function(value) {
        return Array.isArray(value) && value.length > 0;
      },
      message: 'There must be at least one incorrect answer.'
    },
    required: true
  }
});
// Create the model
const Quiz = mongoose.model('Quiz', quizSchema);

// async function insertInitialData() {
//     try {
//       const count = await Quiz.countDocuments();
//       if (count === 0) {
//         await Quiz.insertMany(quizData);
//         console.log("Initial data inserted successfully");
//       } else {
//         console.log("Data already exists, skipping initial insertion");
//       }
//     } catch (error) {
//       console.error("Error inserting initial data:", error);
//     }
//   }



// Route to fetch 15 random quiz questions
app.get('/api/quizzes', async (req, res) => {
    try {
      const quizzes = await Quiz.aggregate([{ $sample: { size: 15 } }]);
      res.status(200).json(quizzes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching random quizzes' });
    }
});

app.get('/', async (req, res) => {
  res.send("Hello")
});


// Start the server
app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
