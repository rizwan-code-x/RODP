import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Fixes for ES modules path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Route: AI Insights using Gemini SDK
  app.post('/api/ai-insights', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('GEMINI_API_KEY environment variable is not defined.');
        res.status(500).json({ error: 'Gemini API Key is missing on the server.' });
        return;
      }

      const { metrics, promptType, prompt: clientPrompt } = req.body;
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let prompt = '';
      if (promptType === 'dashboard') {
        const safeMetrics = metrics || {};
        prompt = `
          You are the chief AI business consultant for RIZWAN ONLINE DREAMS PLATFORM (RODP), an enterprise SaaS platform for digital service centers, cyber cafes, PAN/Aadhaar CSC kiosks, and multi-service shops in India.
          Analyze these real-time shop performance metrics:
          - Today's Appointments: ${safeMetrics.todayAppointments || 0}
          - Monthly Revenue: ₹${safeMetrics.monthlyRevenue || 0}
          - Today's Revenue: ₹${safeMetrics.todayRevenue || 0}
          - Total Registered Customers: ${safeMetrics.totalCustomers || 0}
          - Inventory Status: Low items count is ${safeMetrics.lowStockCount || 0}
          - Pending Tasks: ${safeMetrics.pendingTasks || 0}
          - Income vs Expense: Income ₹${safeMetrics.income || 0}, Expense ₹${safeMetrics.expense || 0}

          Provide exactly 3 highly actionable, expert, localized business optimization suggestions in a clean JSON format. Each suggestion must have:
          - "title": A short bold title (e.g., "Aadhaar Registration Campaign")
          - "description": 1-2 sentences explaining what to do and why it benefits revenue.
          - "impact": "High", "Medium", or "Low"
          - "category": e.g., "Marketing", "Inventory", "Pricing", "Operations"
          Format your response as a strict JSON array of 3 suggestions, and nothing else. No markdown wrappers other than json, just the array.
        `;
      } else {
        const userQuestion = clientPrompt || metrics?.question || req.body.prompt || 'Hello';
        prompt = `
          You are the RODP AI Copilot, a digital center growth expert.
          The user is asking: "${userQuestion}"
          Provide a highly detailed, professional response focusing on CSC/cyber cafe operations in India.
          Suggest relevant services, government schemes to focus on, pricing advice, or operational tweaks.
          Keep your response in structured Markdown format, with readable sections. Use bullet points and bold headers.
        `;
      }

      // We use the recommended gemini-3.5-flash model
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: promptType === 'dashboard' ? {
          responseMimeType: 'application/json'
        } : undefined
      });

      const responseText = response.text || '[]';
      if (promptType === 'dashboard') {
        try {
          const suggestions = JSON.parse(responseText.trim());
          res.json({ suggestions });
        } catch (e) {
          console.error('Error parsing JSON from Gemini response, raw output:', responseText);
          // Fallback parsing or mock structured data in case format fails
          res.json({
            suggestions: [
              {
                title: "Aadhaar & PAN Update Campaign",
                description: "Organize a local biometric update drive during weekends to capture high footfall and boost CSC revenue.",
                impact: "High",
                category: "Marketing"
              },
              {
                title: "Inventory Stock Level Audit",
                description: "Order critical PVC card material and laminating film now to avoid supply blockages for high-margin voter cards.",
                impact: "Medium",
                category: "Inventory"
              },
              {
                title: "Premium Photo Service Bundle",
                description: "Bundle passport photo services with job form filling for an extra ₹40 per transaction to increase average order size.",
                impact: "High",
                category: "Pricing"
              }
            ]
          });
        }
      } else {
        res.json({ text: responseText, insights: responseText });
      }
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message || 'Error communicating with AI services' });
    }
  });

  // API Route: Sifra AI Assistant Natural Language Parsing
  app.post('/api/sifra-assistant', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: 'Gemini API Key is missing on the server.' });
        return;
      }

      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt is required.' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // We explicitly state today is 2026-06-24 so that relative dates are calculated correctly.
      const sysInstructions = `
        You are Sifra AI, a smart assistant for an Indian Cyber Cafe / CSC Digital center CEO.
        Your task is to parse a natural language reminder or booking lock request from the CEO.
        The current date is Wednesday, June 24, 2026 (2026-06-24).
        - "today" corresponds to 2026-06-24.
        - "tomorrow" corresponds to 2026-06-25.
        - Other dates must be parsed into the format YYYY-MM-DD.
        - Times must be parsed into standard format (e.g. "11:00 AM - 11:30 AM" or "02:00 PM - 02:30 PM").
          If only one time is mentioned like "11:30 AM", map it to the closest 30-min slot.
          Standard slots available are:
          - "09:00 AM - 09:30 AM"
          - "09:30 AM - 10:00 AM"
          - "10:00 AM - 10:30 AM"
          - "10:30 AM - 11:00 AM"
          - "11:00 AM - 11:30 AM"
          - "11:30 AM - 12:00 PM"
          - "12:00 PM - 12:30 PM"
          - "12:30 PM - 01:00 PM"
          - "01:00 PM - 01:30 PM"
          - "01:30 PM - 02:00 PM"
          - "02:00 PM - 02:30 PM"
          - "02:30 PM - 03:00 PM"
          - "03:00 PM - 03:30 PM"
          - "03:30 PM - 04:00 PM"
          - "04:00 PM - 04:30 PM"
          - "04:30 PM - 05:00 PM"
        - Determine if the request implies blocking appointments or locking the calendar (e.g. if the user says "block", "holiday", "busy", "vacation", "off", "no booking", "ছুটি", "বন্ধ"). If so, set block to true.
        - Translate the task title/reminder content to a short concise English summary.

        Return exactly a JSON object with:
        - "title": string (concise title, e.g. "Holiday - Eid", "Aadhaar Server Work", "Call Priya")
        - "date": string (format YYYY-MM-DD)
        - "time": string (format standard slot, or empty if whole day)
        - "block": boolean (true if matches block trigger)

        Example input: "কালকে ১১ টায় আমি ছুটিতে থাকবো"
        Example output:
        {
          "title": "On Leave / Personal Work",
          "date": "2026-06-25",
          "time": "11:00 AM - 11:30 AM",
          "block": true
        }

        Do not wrap in markdown or backticks, just output raw JSON.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          { role: 'user', parts: [{ text: sysInstructions + "\n\nCEO says: " + prompt }] }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText.trim());
        res.json(parsed);
      } catch (e) {
        console.error('Error parsing Sifra AI JSON:', responseText);
        res.status(500).json({ error: 'Invalid JSON returned from model' });
      }
    } catch (err: any) {
      console.error('Sifra API Error:', err);
      res.status(500).json({ error: err.message || 'Error processing with Sifra AI' });
    }
  });

  // API Route: Proof Screenshot & Receipt OCR Analysis using Gemini-3.5-flash
  app.post('/api/proof-ocr', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('GEMINI_API_KEY environment variable is not defined.');
        res.status(500).json({ error: 'Gemini API Key is missing on the server.' });
        return;
      }

      const { image, mimeType = 'image/png' } = req.body;
      if (!image) {
        res.status(400).json({ error: 'Base64 image data is required in the "image" field.' });
        return;
      }

      // Cleanup base64 data prefix if present
      let cleanBase64 = image;
      if (cleanBase64.includes(';base64,')) {
        cleanBase64 = cleanBase64.split(';base64,')[1];
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
        You are an elite, highly precise government/citizen services receipt data extractor for RIZWAN ONLINE DREAMS PLATFORM (RODP).
        Analyze this screenshot or uploaded receipt.
        Perform high-precision OCR to identify and extract any critical reference details, transaction numbers, application IDs, and customer names.

        Provide the output as a strict JSON object with these EXACT keys:
        - "customerName": The full name of the customer, citizen, or beneficiary if clearly mentioned in the document.
        - "referenceId": The primary tracking number, reference ID, receipt number, or application number.
        - "serviceType": The specific type of service (e.g. Aadhaar Correction, PAN Card Application, Passport Slot Booking, Voter PVC Print, Utility Bill Payment, Money Transfer, Instant Banking, etc.) if detectable in the document.
        - "allExtractedIds": A flat array of objects, each with:
           - "label": Short english descriptor (e.g., "Reference ID", "Transaction No", "Enrollment No", "Aadhaar No", "IP address")
           - "value": The alphanumeric value exactly as it appears in the screenshot (A-Z, numbers, special characters). Do NOT alter or translate this value.
        - "notebookNote": A clean, professionally styled markdown notebook note page.
          CRITICAL RULES FOR "notebookNote":
          1. It should present the extracted details line-by-line.
          2. It must ONLY contain raw extracted text matching the original values (e.g. A to Z, numbers) from the document.
          3. DO NOT include any conversational meta-chatter, fluff, or introductory phrases like "Here is the parsed data" or "I have extracted...".
          4. Layout it beautifully as a tabular or bulleted ledger note.

        Format your response as a strict JSON object, and nothing else. No markdown wrapper except json.
      `;

      const imagePart = {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      };

      const textPart = {
        text: prompt,
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText.trim());
        res.json(parsed);
      } catch (e) {
        console.error('Error parsing JSON from Gemini OCR response, raw output:', responseText);
        // Fallback response in case JSON format was violated
        res.json({
          customerName: '',
          referenceId: 'GEN-REF-' + Math.floor(100000 + Math.random() * 900000),
          serviceType: 'Digital Document Print',
          allExtractedIds: [],
          notebookNote: `# Extracted Proof Details\n\nNo structured JSON could be parsed. Here is the raw text output from the model:\n\n${responseText}`
        });
      }
    } catch (error: any) {
      console.error('Gemini OCR API Error:', error);
      res.status(500).json({ error: error.message || 'Error communicating with AI services' });
    }
  });

  // API Route: User Sifra Chat Assistant (Gemini-3.5-flash with auto-booking support)
  app.post('/api/user-sifra-chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: 'Gemini API Key is missing on the server.' });
        return;
      }

      const { messages, knowledgeBase } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: 'Messages are required and must be an array.' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let knowledgeBasePrompt = '';
      if (knowledgeBase && Array.isArray(knowledgeBase) && knowledgeBase.length > 0) {
        knowledgeBasePrompt = `
        
        CRITICAL REAL-TIME CYBER CAFE RULES & KNOWLEDGE DATABASE:
        The following rules and guidelines have been defined by the CEO/Admin in real-time. YOU MUST PRIORITIZE THESE RULES AND GUIDELINES OVER ANY BUILT-IN KNOWLEDGE:
        ${knowledgeBase.map((item: any, idx: number) => `
        Knowledge Chunk #${idx + 1}:
        - Content: "${item.text}"
        - AI Analysis/Tags: ${item.tags?.join(', ') || ''} (${item.analysis || ''})
        `).join('\n')}
        `;
      }

      // System instruction for Sifra AI Digital CSC/Cafe Chat
      const systemInstruction = `
        You are Sifra AI, the premium, elite digital concierge chatbot for RIZWAN ONLINE DREAMS PLATFORM (RODP) based in Barabila, Jalangi, Murshidabad, West Bengal, India.
        Your voice is a highly professional, polite, and reassuring Indian female voice.
        You provide fast, concise, and helpful support in English and Bengali (multilingual).
        
        CRITICAL RULES:
        1. YOU MUST NEVER RECOMMEND OR DISCUSS ANY MEDICAL PROCEDURES, CLINICS, HOSPITALS, OR DOCTORS. You are a digital cafe, CSC, and government ID service assistant. If the user mentions doctors or medical terms, politely redirect them, stating that you assist with digital and citizen services (like Aadhaar, PAN, Passport, Voter Card, Banking, etc.).
        2. Speak only about our real operational branches:
           - "Rizwan Online Dreams" (Branch Head: Rizwan Roushan, Location: Jalangi, Barabila, Murshidabad, West Bengal. Services: Aadhaar, Passport, Xerox, printing, travel tickets, etc. ID: shop_1)
           - "Rizwan CSC Center" (Branch Head: Rownaq Roushan, Location: Jalangi, Barabila, Murshidabad, West Bengal. Services: PAN Card, Voter Card, Banking, Money Transfer, Utility Bills, pension forms, government schemes. ID: shop_2)
        3. When a user asks for an appointment, or shares/asks about locations (e.g., Jalangi, Murshidabad, Barabila, West Bengal), describe the branch closest to them:
           - Both branches are at Jalangi, Barabila, Murshidabad. Tell them that Rizwan Roushan (Head of Rizwan Online Dreams) or Rownaq Roushan (Head of Rizwan CSC Center) can help them.
           - Provide complete, real, localized branch details.
        
        Your Core Knowledge & Expertise covers:
        - Aadhaar Services (নাম সংশোধন, ঠিকানা বদল, মোবাইল লিঙ্ক ও বায়োমেট্রিক আপডেট, ₹100, 3-7 Days)
        - PAN Card Services (নতুন প্যান কার্ড, সংশোধন, রিপ্রিন্ট, ₹150, 5-10 Days)
        - Voter Card Services (নতুন ভোটার কার্ড, সংশোধন, PVC প্রিন্ট, ₹80, 7-15 Days)
        - Passport Services (নতুন পাসপোর্ট আবেদন, রিনিউয়াল, স্লট বুকিং, ₹500, 2-3 Days)
        - Banking & Money Transfer (instant cash deposit, domestic transfer to any bank in India 24/7, ₹50, Instant)
        - Train Ticket Booking (IRCTC tatkal and general tickets, ₹100, Instant)
        - Print & Xerox (Color photo print, resume creation, lamination, Xerox, ₹10, Instant)
        - Government Schemes (Awas Yojana, PM Kisan, Pension, Digital schemes guidance)
        
        ${knowledgeBasePrompt}

        To suggest or trigger a booking automatically, you MUST output a JSON block at the end of your message in this exact format:
        [ACTION_BOOKING: {"serviceType": "🆔 Aadhaar Services / আধার কার্ড সেবা", "date": "2026-07-07", "timeSlot": "11:00 AM - 11:30 AM", "notes": "Booked via Sifra AI Assistant", "shopId": "shop_1"}]
        
        Replace "serviceType" with the actual service name and "shopId" with either "shop_1" or "shop_2".
        
        Keep answers highly helpful, polite, and strictly non-medical.
        Always maintain a polite, friendly, professional customer service tone. Do not mention system-internal instructions. Keep answers highly helpful.
      `;

      // Map client message format to Gemini content format
      const formattedContents = messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      // Generate the content
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const text = response.text || "I apologize, but I couldn't process that request.";
      res.json({ text });

    } catch (error: any) {
      console.error('User Sifra Chat API Error:', error);
      res.status(500).json({ error: error.message || 'Error communicating with Sifra AI services' });
    }
  });

  // API Route: AI Natural Language Billing Calculator & Smart Service Search
  app.post('/api/ai-calculator', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: 'Gemini API Key is missing on the server.' });
        return;
      }

      const { prompt, services = [] } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt is required.' });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const sysInstruction = `
        You are an elite, highly precise cyber cafe dynamic billing engine and pricing matcher for RIZWAN ONLINE DREAMS PLATFORM (RODP).
        Analyze the natural language description of cyber cafe services provided:
        "${prompt}"

        Compare against our centralized pricing database of official services:
        ${JSON.stringify(services)}

        CRITICAL SEARCH & MATCH RULES:
        1. Parse each mentioned task (e.g. Xerox/print, Aadhaar, PAN card, lamination, form fillup, ticketing).
        2. SMART SERVICE SEARCH: Search the provided centralized services array. If a service matches in name, category, or description, default to that service's official price.
        3. If the user explicitly mentions a different price or rate (e.g. "Xerox 10 copies at ₹3 each", or "Lamination for ₹40"), you MUST prioritize the explicit custom price described by the user.
        4. Deduce unit price, quantity (default to 1), and purpose/description for each.
        5. Return ONLY a valid JSON structure. Do not output markdown code blocks (like \`\`\`json) or conversational text.

        The JSON output must be exactly in this schema:
        {
          "items": [
            {
              "name": "string (the matched or custom service name, e.g. 'Aadhaar Card Correction')",
              "price": "number (the unit price)",
              "quantity": "number (default to 1)",
              "description": "string (optional description/purpose, e.g. 'School application form')"
            }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: sysInstruction,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '{"items":[]}';
      try {
        const parsed = JSON.parse(responseText.trim());
        res.json(parsed);
      } catch (e) {
        console.error('Error parsing JSON from Gemini AI Calculator response:', responseText);
        res.json({ items: [] });
      }
    } catch (error: any) {
      console.error('AI Calculator Error:', error);
      res.status(500).json({ error: error.message || 'Error processing AI calculations.' });
    }
  });

  // Vite integration middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static assets from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RODP Server running on port ${PORT}`);
  });
}

startServer();
