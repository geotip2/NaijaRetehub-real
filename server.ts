import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Payout Endpoint (Admin function to pay out referral earnings)
  app.post("/api/payouts/transfer", async (req, res) => {
    const { amount, bankCode, accountNumber, currency = "NGN", userId } = req.body;
    
    const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
    if (!FLW_SECRET_KEY) {
      return res.status(500).json({ error: "Flutterwave secret key not configured" });
    }

    try {
      // In a real app, you would verify the user's balance in Supabase first
      // This is the call to Flutterwave Transfer API
      const response = await fetch("https://api.flutterwave.com/v3/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
        },
        body: JSON.stringify({
          account_bank: bankCode,
          account_number: accountNumber,
          amount: amount,
          currency: currency,
          narration: "NaijaRemoteHub Payout",
          reference: `NRH-${Date.now()}-${userId}`,
          callback_url: `${process.env.APP_URL}/api/hooks/flutterwave`,
          debit_currency: "NGN",
        }),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Payout error:", error);
      res.status(500).json({ error: "Failed to initiate payout" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
