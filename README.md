# 🔨 Open Bidding Simulation - Biddr

Biddr is a web-based open bidding platform designed to simulate real-world auction dynamics using core concepts from economics and game theory. Built with the **MERN** stack, Biddr provides an interactive environment for users to participate in auctions as rational agents, allowing real-time bidding, data analytics, and auction strategy exploration.

## 🚀 Features

- 🕒 Real-time bidding functionality
- 🧠 Integration of auction theory and game theory (e.g., Nash equilibrium)
- 🎛️ Bidding Dashboard with Auction History
- 💬 Instant UI updates using WebSockets

## 🧱 Tech Stack

| Layer      | Technology           |
|------------|----------------------|
| Frontend   | React.js             |
| Backend    | Node.js, Express.js  |
| Database   | MongoDB              |
| Real-time  | Socket.io            |

## ⚙️ Installation & Running Locally

### Prerequisites

- Node.js & npm
- MongoDB (local or cloud - e.g., MongoDB Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/403ENDer/biddingSimulator.git
cd biddr
````

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

The frontend will run on [http://localhost:3000](http://localhost:3000) and connect to the backend on port `5000`.

## 📖 Theory & Concepts

* **Game Theory:** Nash Equilibrium, Strategic Bidding
* **Bidder Rationality:** Participants modeled as rational agents
* **Live Tracking:** Dynamic charts for bid history, price movement, and participant strategy

## 📌 Use Cases

* 📚 Academic simulations
* 🧪 Behavioral economics experiments
* 📈 Auction strategy analysis and testing

## 🤝 Contributing

Pull requests and feature suggestions are welcome! Feel free to fork and improve.

## 🪪 License

MIT License
