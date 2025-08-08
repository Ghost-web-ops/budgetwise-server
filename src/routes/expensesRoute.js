import express from 'express';
import auth from '../middleware/auth.js';
import pool from '../db.js';
const router = express.Router();

router.get('/expenses', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM expenses WHERE user_id = $1', [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/expenses', auth, async (req, res) => {
    const { amount, description, category } = req.body;

    if (!amount || !description || !category) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO expenses (user_id, amount, description, category) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.userId, amount, description, category]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.delete('/expenses/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found or does not belong to user' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.patch('/expenses/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { amount, description, category } = req.body;

    if (!amount || !description || !category) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // --- الجزء السحري يبدأ هنا ---
        const fields = [];
        const values = [];
        let queryIndex = 1;

        if (amount) {
            fields.push(`amount = $${queryIndex++}`);
            values.push(amount);
        }
        if (description) {
            fields.push(`description = $${queryIndex++}`);
            values.push(description);
        }
        if (category) {
            fields.push(`category = $${queryIndex++}`);
            values.push(category);
        }

        // إضافة الشروط النهائية للأمان
        values.push(id, req.user.id);

        const updateQuery = `UPDATE expenses SET ${fields.join(', ')} WHERE id = $${queryIndex++} AND user_id = $${queryIndex++} RETURNING *`;
        // --- الجزء السحري ينتهي هنا ---

        const result = await pool.query(updateQuery, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found or does not belong to user' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;