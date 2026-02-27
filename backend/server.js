const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Setup multer to store file in memory
const upload = multer({
  storage: multer.memoryStorage(),
});

app.post('/api/parse-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a PDF.' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Invalid file type. Please upload a PDF file.' });
    }

    const data = await pdf(req.file.buffer);
    const fullText = data.text;
    
    // Get the first 300 characters for preview
    const extractedTextSnippet = fullText.substring(0, 300);

    return res.status(200).json({
      message: 'Resume text extracted successfully! (AI analysis coming soon...)',
      snippet: extractedTextSnippet,
    });
  } catch (error) {
    console.error('Error parsing document:', error);
    return res.status(500).json({ error: 'Failed to parse the PDF document' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
