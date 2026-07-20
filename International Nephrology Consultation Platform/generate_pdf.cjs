const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('📖 Starting PDF generation...');
  
  const markdownPath = path.join(__dirname, '../DEVELOPER_AND_FLOW_GUIDE.md');
  const outputPath = path.join(__dirname, '../DEVELOPER_AND_FLOW_GUIDE.pdf');
  
  if (!fs.existsSync(markdownPath)) {
    console.error(`❌ Source markdown file not found at ${markdownPath}`);
    process.exit(1);
  }
  
  const markdownText = fs.readFileSync(markdownPath, 'utf8');
  
  // Create HTML template
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NephroConsult Developer Guide</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown.min.css">
  <style>
    body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
    }
    @media (max-width: 767px) {
      .markdown-body {
        padding: 15px;
      }
    }
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
    }
    /* PDF print optimizations */
    @media print {
      body {
        padding: 0;
        background-color: white;
      }
      .markdown-body {
        padding: 0;
      }
      pre, code, blockquote {
        page-break-inside: avoid;
      }
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
      }
    }
    /* Mermaid diagram container styling */
    .mermaid {
      background: #f6f8fa;
      padding: 15px;
      border-radius: 6px;
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div id="markdown-raw" style="display: none;">${escapeHtml(markdownText)}</div>
  <article class="markdown-body" id="content">
    Loading and rendering content...
  </article>

  <!-- Marked Markdown Parser CDN -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <!-- Mermaid CDN -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  
  <script>
    try {
      const markdownRaw = document.getElementById('markdown-raw').textContent;
      
      // Parse markdown to HTML
      const html = marked.parse(markdownRaw, {
        gfm: true,
        breaks: true
      });
      
      const contentEl = document.getElementById('content');
      contentEl.innerHTML = html;
      
      // Select all mermaid code blocks and turn them into div.mermaid
      const codeElements = document.querySelectorAll('pre code.language-mermaid');
      codeElements.forEach((codeEl) => {
        const preEl = codeEl.parentElement;
        const divEl = document.createElement('div');
        divEl.className = 'mermaid';
        divEl.textContent = codeEl.textContent;
        preEl.parentNode.replaceChild(divEl, preEl);
      });
      
      // Initialize and render Mermaid diagrams
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: { useMaxWidth: true, htmlLabels: true }
      });
      
      console.log('✅ JS Rendering inside browser completed successfully.');
      window.renderingDone = true;
    } catch (err) {
      console.error('❌ Error during JS rendering inside browser:', err);
      window.renderingError = err.message;
    }
  </script>
</body>
</html>
  `;
  
  console.log('🚀 Launching headless Chromium browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set content directly
  await page.setContent(htmlContent);
  
  console.log('⏳ Waiting for Markdown and Mermaid rendering...');
  // Wait for the window.renderingDone flag or timeout
  await page.waitForFunction(() => window.renderingDone || window.renderingError);
  
  // Check for rendering errors
  const renderingError = await page.evaluate(() => window.renderingError);
  if (renderingError) {
    console.error('❌ Rendering error inside browser:', renderingError);
    await browser.close();
    process.exit(1);
  }
  
  // Let Mermaid complete diagram layout
  await page.waitForTimeout(2000);
  
  console.log('📄 Exporting page to PDF...');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '20mm',
      right: '20mm'
    },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="font-size: 8px; margin: 0 auto; text-align: center; width: 100%; color: #888;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
  });
  
  console.log(`✅ PDF created successfully at ${outputPath}`);
  await browser.close();
}

// Helper to escape HTML tags so they don't break the raw text element
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

main().catch(err => {
  console.error('❌ Fatal error in script:', err);
  process.exit(1);
});
