const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/intent", (req, res) => {
    const {goal, amount} = req.body;

    let strategy;

    if (goal === "maximize_profit") {
        strategy = {
            steps: ["swap_SOL_USDC", "lend_USDC"]
        };
    } else {
        strategy = {
            steps: ["holds"]
        };
    }

    res.json(strategy)
});

app.listen(3001, () => {
    console.log("Backend running on http://localhost:3001")
})