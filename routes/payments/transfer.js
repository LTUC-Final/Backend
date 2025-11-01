router.post("/transfer-to-provider/:provider_id", async (req, res) => {
  try {
    const { provider_id } = req.params;
    const { amount } = req.body;

    // 1️⃣ جلب حساب Stripe الخاص بالبروفايدر
    const result = await pool.query(
      "SELECT stripe_account_id FROM providers WHERE provider_id = $1",
      [provider_id]
    );
    const stripeAccountId = result.rows[0]?.stripe_account_id;

    if (!stripeAccountId)
      return res
        .status(400)
        .json({ error: "Provider does not have a connected Stripe account" });

    // 2️⃣ تنفيذ التحويل من حساب المنصة إلى حساب البروفايدر
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // تحويل من دولار إلى سنت
      currency: "usd",
      destination: stripeAccountId,
      transfer_group: `PROVIDER_${provider_id}`,
    });

    // 3️⃣ خصم المبلغ من جدول الرصيد المحلي
    await pool.query(
      `UPDATE provider_balance 
       SET total_balance = total_balance - $1
       WHERE provider_id = $2`,
      [amount, provider_id]
    );

    res.json({
      message: "Transfer successful",
      transfer_id: transfer.id,
    });
  } catch (error) {
    console.error("Error transferring funds:", error);
    res
      .status(500)
      .json({ error: "Failed to transfer funds", details: error.message });
  }
});
