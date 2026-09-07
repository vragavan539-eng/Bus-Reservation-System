const SYSTEM_PROMPT = `You are "Busy", the friendly support assistant for BusGo, a Tamil Nadu bus ticket booking website.
You help travellers with: booking buses, cancellations & refunds, luggage rules, live bus tracking, wallet & coupons, and general travel questions about Tamil Nadu routes.
Keep replies short (2-4 sentences), warm, and practical. If you don't know something specific to this user's booking (like their exact seat or PNR), tell them to check "My Bookings" or ask them to share their booking ID.
If the user writes in Tamil, reply in Tamil. If they mix Tanglish, you can reply in Tanglish too. Never invent booking details you don't have.`;

// history: array of { sender: 'user' | 'agent' | 'bot', message: string }
async function generateBotReply(history, latestUserMessage) {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history
        .filter(m => m.sender === 'user' || m.sender === 'bot')
        .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.message })),
      { role: 'user', content: latestUserMessage },
    ];

    // Using raw fetch instead of groq-sdk — the SDK was timing out on this
    // machine even though the API itself is reachable (confirmed via a
    // plain fetch to /models), so we talk to the REST endpoint directly.
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages,
        max_tokens: 200,
        temperature: 0.6,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || `Groq API returned status ${res.status}`);
    }

    return data.choices[0].message.content.trim();
  } catch (err) {
    const detail = err.message;
    console.error('Groq reply failed:', detail);
    return `[DEBUG] Groq error: ${detail}`;
  }
}

module.exports = { generateBotReply };