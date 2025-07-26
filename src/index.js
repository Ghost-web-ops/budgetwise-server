import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db.js';
import userRoutes from './routes/userRoute.js';
import expensesRoutes from './routes/expensesRoute.js';
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', userRoutes); 
app.use('/api', expensesRoutes);



app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port in ${PORT}`);
});