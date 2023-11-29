import express from 'express';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import { promises as fsPromises } from 'fs';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/generate_diagram', async (req, res) => {
  const mermaidCode = req.body.text;

  console.log('Received Mermaid Code:', mermaidCode);

  if (!mermaidCode) {
    return res.status(400).send('Bad Request: Mermaid code is missing in the request body.');
  }

  // Fetch the Mermaid library from the CDN
  const mermaidScript = await fetch('https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js').then(response => response.text());

  // Save the Mermaid code to a file
  try {
    await fsPromises.writeFile('architecture.mmd', mermaidCode);
  } catch (error) {
    console.error('Error writing file:', error.message);
    return res.status(500).send('Internal Server Error');
  }

  // Use mmdc to convert Mermaid code to an image
  exec('mmdc -i architecture.mmd -o architecture_diagram.png', (error) => {
    if (error) {
      console.error('Error executing mmdc:', error.message);
      return res.status(500).send('Internal Server Error');
    }
  
    // Create an absolute path to the generated image file
    const imagePath = resolve(__dirname, 'architecture_diagram.png');
  
    // Return the generated diagram as a response
    res.sendFile(imagePath);
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
