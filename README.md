# AI Shopping List

A modern shopping list application powered by Azure OpenAI that understands natural language.

## Features

- 🤖 Natural language processing - just say what you need
- 🛒 Automatic item parsing and quantity extraction
- 💬 Chat interface for easy interaction
- 💾 Local storage persistence
- ✨ Modern, responsive design

## Setup

1. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

2. Add your Azure OpenAI credentials to `.env`:
```
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

3. Install dependencies and start the server:
```bash
npm install dotenv
node server.js
```

4. Open http://localhost:3000 in your browser

## Alternative: Browser-only Mode

Open `shopping-list.html` directly in your browser and configure via console:
```javascript
app.config.setConfig({
    azureEndpoint: "https://your-resource-name.openai.azure.com/",
    azureKey: "your-api-key",
    azureDeployment: "your-deployment-name"
})
```

## Usage Examples

- "I need milk, bread, and eggs"
- "Add 2 pounds of chicken breast"
- "Remove milk from the list"
- "Update bread to 2 loaves"

The AI will ask for quantities if not specified and intelligently parse your requests!
