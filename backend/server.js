const express = require('express');
const cors = require('cors');
require('dotenv').config();

const OpenAI = require('openai');
const { tavily } = require('@tavily/core');

const app = express();

app.use(cors());
app.use(express.json());

/* -----------------------------
   GROQ AI
----------------------------- */

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

/* -----------------------------
   TAVILY SEARCH
----------------------------- */
let tvly = null;

if (process.env.TAVILY_API_KEY) {
  tvly = tavily({
    apiKey: process.env.TAVILY_API_KEY,
  });
}

/* -----------------------------
   CHAT ROUTE
----------------------------- */

app.post('/chat', async (req, res) => {
  try {
    console.log('Request received');

    const messages = req.body.messages;

    const userMessage =
      messages[messages.length - 1].content;

    console.log('User message:', userMessage);

    /* -----------------------------
       SEARCH INTERNET
    ----------------------------- */

    let webData = '';

    try {
      if (tvly) {
  const searchResult =
    await tvly.search(userMessage);

  webData = searchResult.results
    .map((item) => item.content)
    .join('\n');
}
    } catch (searchError) {
      console.log(
        'Search Error:',
        searchError.message
      );
    }

    /* -----------------------------
       AI RESPONSE
    ----------------------------- */

    const response =
      await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',

        messages: [
          {
            role: 'system',
            content: `
You are a modern AI assistant like ChatGPT.

Rules:
- Give short answers for simple questions
- Give detailed answers only when needed
- Format code properly using markdown
- Use bullet points when useful
- Be conversational and natural
- If user asks coding questions, return clean code blocks
- Use latest internet data from WEB DATA

WEB DATA:
${webData}
`,
          },

          ...messages,
        ],

        temperature: 0.7,
        max_tokens: 2000,
      });

    const aiReply =
      response.choices[0].message.content;

    console.log('AI response sent');

    res.json({
      reply: aiReply,
    });
  } catch (error) {
    console.log('FULL ERROR:');
    console.log(error);

    res.status(500).json({
      error: 'AI Error',
    });
  }
});

/* -----------------------------
   SERVER
----------------------------- */
app.get('/', (req, res) => {
  res.json({
    status: 'Backend Running',
  });
});
app.listen(5000, () => {
  console.log(
    'Server running on port 5000'
  );
});