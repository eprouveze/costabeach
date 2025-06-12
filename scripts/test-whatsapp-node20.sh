#!/bin/bash
# Test WhatsApp with Node.js 20 for compatibility

echo "🔄 Switching to Node.js 20 for WhatsApp testing..."

# Check if nvm is available
if command -v nvm >/dev/null 2>&1; then
    source ~/.nvm/nvm.sh
    nvm use 20
    echo "✅ Using Node $(node --version)"
    
    echo "📱 Testing WhatsApp Baileys integration..."
    npm run whatsapp:simple
else
    echo "❌ nvm not found. Please install nvm or manually switch to Node.js 20"
    echo "💡 Alternative: docker run -v $(pwd):/app -w /app node:20 npm run whatsapp:simple"
fi