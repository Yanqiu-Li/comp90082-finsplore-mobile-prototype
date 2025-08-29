const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory data store for prototype
let goals = [];
let goalIdCounter = 1;

// Add sample data for testing
function initializeSampleData() {
    // Sample Goal 1
    const sampleGoal1 = {
        _id: '1',
        title: 'Emergency Fund',
        category: 'Savings',
        targetAmount: 10000,
        initialAmount: 2500,
        currentAmount: 2500,
        deadline: new Date('2025-12-31'),
        motivation: 'Build a safety net for unexpected expenses',
        estimatedMonthlyContribution: 500,
        contributions: [
            {
                _id: 'contrib_1_1',
                amount: 2500,
                date: new Date('2024-01-01'),
                source: 'Other',
                note: 'Initial contribution',
                createdAt: new Date('2024-01-01')
            }
        ],
        isCompleted: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    };

    // Sample Goal 2
    const sampleGoal2 = {
        _id: '2',
        title: 'New Car',
        category: 'Other',
        targetAmount: 25000,
        initialAmount: 5000,
        currentAmount: 8000,
        deadline: new Date('2025-06-30'),
        motivation: 'Replace my old car with a reliable vehicle',
        estimatedMonthlyContribution: 1000,
        contributions: [
            {
                _id: 'contrib_2_1',
                amount: 5000,
                date: new Date('2024-01-01'),
                source: 'Other',
                note: 'Initial contribution',
                createdAt: new Date('2024-01-01')
            },
            {
                _id: 'contrib_2_2',
                amount: 3000,
                date: new Date('2024-02-01'),
                source: 'Bonus',
                note: 'Year-end bonus',
                createdAt: new Date('2024-02-01')
            }
        ],
        isCompleted: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-02-01')
    };

    goals.push(sampleGoal1, sampleGoal2);
    goalIdCounter = 3;
    console.log('Sample data initialized:', goals.length, 'goals loaded');
}

// Initialize sample data on server start
initializeSampleData();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Helper function to calculate goal stats
function calculateGoalStats(goal) {
    const progressPercentage = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
    
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const msPerMonth = 1000 * 60 * 60 * 24 * 30.44;
    const monthsRemaining = Math.max(1, Math.ceil((deadline - now) / msPerMonth));
    const suggestedMonthlyContribution = Math.ceil(remainingAmount / monthsRemaining);
    const isFeasible = goal.estimatedMonthlyContribution ? goal.estimatedMonthlyContribution >= suggestedMonthlyContribution : null;
    
    return {
        ...goal,
        progressPercentage,
        remainingAmount,
        suggestedMonthlyContribution,
        isFeasible,
        isCompleted: goal.currentAmount >= goal.targetAmount
    };
}

// API Routes
// Get all goals
app.get('/api/goals', (req, res) => {
    const goalsWithStats = goals.map(calculateGoalStats);
    res.json(goalsWithStats);
});

// Get goal statistics (must come before :id route to avoid conflicts)
app.get('/api/goals/stats/summary', (req, res) => {
    try {
        const totalGoals = goals.length;
        const activeGoals = goals.filter(g => !g.isCompleted).length;
        const completedGoals = goals.filter(g => g.isCompleted).length;
        
        const avgProgress = totalGoals > 0 
            ? Math.round(goals.reduce((sum, goal) => {
                const stats = calculateGoalStats(goal);
                return sum + stats.progressPercentage;
            }, 0) / totalGoals)
            : 0;

        res.json({
            totalGoals,
            activeGoals,
            completedGoals,
            avgProgress
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get goal by ID
app.get('/api/goals/:id', (req, res) => {
    const goal = goals.find(g => g._id === req.params.id);
    if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
    }
    const goalWithStats = calculateGoalStats(goal);
    res.json(goalWithStats);
});

// Create new goal
app.post('/api/goals', (req, res) => {
    try {
        const {
            title,
            category,
            targetAmount,
            initialAmount,
            deadline,
            motivation,
            estimatedMonthlyContribution
        } = req.body;

        // Validation
        if (!title || title.length < 1 || title.length > 60) {
            return res.status(400).json({ message: 'Title must be between 1 and 60 characters' });
        }

        if (!targetAmount || targetAmount <= 0) {
            return res.status(400).json({ message: 'Target amount must be greater than 0' });
        }

        if (initialAmount < 0) {
            return res.status(400).json({ message: 'Initial amount cannot be negative' });
        }

        if (initialAmount > targetAmount) {
            return res.status(400).json({ message: 'Initial amount cannot exceed target amount' });
        }

        if (!deadline || new Date(deadline) <= new Date()) {
            return res.status(400).json({ message: 'Deadline must be in the future' });
        }

        const goal = {
            _id: goalIdCounter.toString(),
            title,
            category: category || 'Savings',
            targetAmount,
            initialAmount: initialAmount || 0,
            currentAmount: initialAmount || 0,
            deadline: new Date(deadline),
            motivation: motivation || '',
            estimatedMonthlyContribution,
            contributions: [],
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Add initial contribution if there's an initial amount
        if (initialAmount > 0) {
            goal.contributions.push({
                _id: `contrib_${goalIdCounter}_1`,
                amount: initialAmount,
                date: new Date(),
                source: 'Other',
                note: 'Initial contribution',
                createdAt: new Date()
            });
        }

        goals.push(goal);
        goalIdCounter++;

        const goalWithStats = calculateGoalStats(goal);
        res.status(201).json(goalWithStats);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add contribution to goal
app.post('/api/goals/:id/contributions', (req, res) => {
    try {
        const goalIndex = goals.findIndex(g => g._id === req.params.id);
        if (goalIndex === -1) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        const { amount, date, source, note } = req.body;

        // Validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than 0' });
        }

        const contribution = {
            _id: `contrib_${req.params.id}_${Date.now()}`,
            amount,
            date: date ? new Date(date) : new Date(),
            source: source || 'Other',
            note: note || '',
            createdAt: new Date()
        };

        goals[goalIndex].contributions.push(contribution);
        goals[goalIndex].currentAmount += amount;
        goals[goalIndex].updatedAt = new Date();

        if (goals[goalIndex].currentAmount >= goals[goalIndex].targetAmount) {
            goals[goalIndex].isCompleted = true;
        }

        const goalWithStats = calculateGoalStats(goals[goalIndex]);
        res.json(goalWithStats);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete goal
app.delete('/api/goals/:id', (req, res) => {
    try {
        console.log('DELETE request for goal ID:', req.params.id);
        console.log('Available goals:', goals.map(g => ({ id: g._id, title: g.title })));
        
        const goalIndex = goals.findIndex(g => g._id === req.params.id);
        if (goalIndex === -1) {
            console.log('Goal not found with ID:', req.params.id);
            return res.status(404).json({ message: 'Goal not found' });
        }

        const deletedGoal = goals[goalIndex];
        goals.splice(goalIndex, 1);
        
        console.log('Goal deleted successfully:', deletedGoal.title);
        res.json({ 
            message: 'Goal deleted successfully', 
            deletedGoal: { _id: deletedGoal._id, title: deletedGoal.title } 
        });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ message: error.message });
    }
});


// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Dashboard-EN.html'));
});

app.get('/create-goal', (req, res) => {
    res.sendFile(path.join(__dirname, 'CreateGoal-Step1-EN.html'));
});

app.get('/create-goal-step2', (req, res) => {
    res.sendFile(path.join(__dirname, 'CreateGoal-Step2-EN.html'));
});

app.get('/create-goal-step3', (req, res) => {
    res.sendFile(path.join(__dirname, 'CreateGoal-Step3-EN.html'));
});

app.get('/goal/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'GoalDetail-EN.html'));
});

app.get('/quick-contribution', (req, res) => {
    res.sendFile(path.join(__dirname, 'QuickContribution-EN.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Dashboard: http://localhost:${PORT}`);
    console.log('Using in-memory data store for prototype');
});