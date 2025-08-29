# FP-Koala Financial Goals Prototype

This is a working prototype implementation of User-Scenario-01 (Create a SMART Goal) from the FP-Koala financial planning application.

## Features Implemented

### ✅ User-Scenario-01: Create a SMART Goal
- **3-step goal creation wizard**:
  - Step 1: Basic Information (Title, Category, Target Amount, Initial Amount)
  - Step 2: Time & Relevance (Deadline, Motivation, Estimated Monthly Contribution)
  - Step 3: Review & Confirm (Summary with feasibility analysis)
- **Dynamic feasibility analysis** with suggested monthly contributions
- **Form validation** according to requirements
- **Success flow** with redirect to Goal Detail page

### ✅ Additional Features (Supporting Scenarios 2 & 3)
- **Dashboard**: Overview of all goals with statistics and progress
- **Goal Detail Page**: Detailed view with progress tracking and contribution history
- **API Integration**: Full RESTful backend with goal CRUD operations

## Tech Stack

- **Frontend**: HTML, CSS (Tailwind), JavaScript (Vanilla)
- **Backend**: Node.js with Express
- **Data Storage**: In-memory store (for prototype - easily replaceable with MongoDB)
- **API**: RESTful JSON API

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```

3. **Open in Browser**:
   ```
   http://localhost:3000
   ```

## Project Structure

```
/
├── server.js                    # Express server with in-memory data store
├── package.json                 # Node.js dependencies and scripts
├── Dashboard-EN.html            # Main dashboard page
├── CreateGoal-Step1-EN.html     # Goal creation - Step 1: Basics
├── CreateGoal-Step2-EN.html     # Goal creation - Step 2: Time & Relevance
├── CreateGoal-Step3-EN.html     # Goal creation - Step 3: Review
├── GoalDetail-EN.html           # Goal detail view
├── QuickContribution-EN.html    # Quick contribution interface
└── README.md                    # This file
```

## API Endpoints

- `GET /api/goals` - List all goals
- `GET /api/goals/:id` - Get specific goal
- `POST /api/goals` - Create new goal
- `POST /api/goals/:id/contributions` - Add contribution to goal
- `GET /api/goals/stats/summary` - Get dashboard statistics

## User Flow

1. **Dashboard** (`/`) - View existing goals or create first goal
2. **Create Goal Step 1** (`/create-goal`) - Enter basic information
3. **Create Goal Step 2** (`/create-goal-step2`) - Set deadline and motivation
4. **Create Goal Step 3** (`/create-goal-step3`) - Review and confirm
5. **Goal Detail** (`/goal/:id`) - View created goal with progress tracking

## Key Features

### Form Validation
- Title: 1-60 characters, required
- Target Amount: Must be > 0, required
- Initial Amount: Must be ≥ 0 and ≤ Target Amount
- Deadline: Must be future date, required
- Motivation: Optional, max 200 characters

### Feasibility Analysis
- Calculates suggested monthly contribution based on remaining amount and time
- Shows "Feasible" or "At Risk" badge based on estimated vs suggested amounts
- Dynamic timeline preview

### Data Persistence
- Form data persists across steps using localStorage
- Goals saved to in-memory backend (easily replaceable with database)
- Contribution tracking and progress calculation

## Development Notes

This prototype uses an in-memory data store for simplicity. In production, this would be replaced with:
- MongoDB (as specified in requirements)
- User authentication
- Data persistence across server restarts

The frontend is built with vanilla JavaScript and Tailwind CSS to match the existing design mockups while providing full functionality.

## Browser Compatibility

- Modern browsers with ES6+ support
- Mobile-responsive design (375px phone mockup)
- Cross-browser tested

## Testing

The prototype includes:
- Client-side form validation
- Server-side API validation
- Error handling and user feedback
- Success flows with appropriate redirects

## Future Enhancements

Ready for extension with:
- User authentication
- Database integration (MongoDB)
- Additional scenarios (contributions, automation)
- Bank account integration
- Notification services