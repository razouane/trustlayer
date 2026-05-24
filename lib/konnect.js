export async function initiatePayment({ orderId, amount, description }) {
  const res = await fetch(`${process.env.KONNECT_API_URL}/payments/init`, {
    method: 'POST',
    headers: { 'x-api-key': process.env.KONNECT_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      receiverWalletId: process.env.KONNECT_WALLET_ID,
      token: 'TND',
      amount: Math.round(amount * 1000),
      description,
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/order/${orderId}/success`,
      failUrl: `${process.env.NEXT_PUBLIC_APP_URL}/order/${orderId}/failed`,
      orderId,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur Konnect');
  return { payUrl: data.payUrl, paymentRef: data.paymentRef };
}
