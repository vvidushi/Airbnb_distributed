# Ollama Setup Guide - Local AI Model

This AI agent now uses **Ollama** - a completely **offline, free** AI model that runs locally on your machine.

## 🚀 Quick Setup

### Step 1: Install Ollama

**macOS:**
```bash
# Download and install from website
# Visit: https://ollama.com/download

# Or use Homebrew
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from: https://ollama.com/download

### Step 2: Download a Model

After installing Ollama, download a model:

```bash
# Option 1: Llama 2 (Recommended - ~4GB)
ollama pull llama2

# Option 2: Mistral (Smaller, faster - ~4GB)
ollama pull mistral

# Option 3: Phi (Very small - ~1.6GB)
ollama pull phi
```

### Step 3: Start Ollama Server

```bash
ollama serve
```

Keep this running in a separate terminal!

### Step 4: Test It

```bash
# In another terminal
ollama run llama2
```

Type a question and press Enter. Type `/bye` to exit.

## 🔧 Configure AI Agent

Edit `ai-agent/.env`:

```env
# Use the model you downloaded
OLLAMA_MODEL=llama2
OLLAMA_BASE_URL=http://localhost:11434
```

Available models:
- `llama2` - Good balance of quality and speed
- `mistral` - Faster, still good quality
- `phi` - Smallest, fastest, less smart

## 🏃 Running the AI Agent

```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start AI Agent
cd ai-agent
source venv/bin/activate
python app/main.py
```

## ✅ Verify It's Working

Visit: http://localhost:8000/api/ai/test

Should show:
```json
{
  "status": "AI service is running",
  "model_type": "Ollama (Local/Offline)",
  "ollama_running": true,
  "model": "llama2"
}
```

## 📊 Model Comparison

| Model | Size | Speed | Quality | RAM Needed |
|-------|------|-------|---------|------------|
| **llama2** | 4GB | Medium | Good | 8GB+ |
| **mistral** | 4GB | Fast | Good | 8GB+ |
| **phi** | 1.6GB | Very Fast | Okay | 4GB+ |

## 🐛 Troubleshooting

### "Ollama is not running"
```bash
# Start Ollama server
ollama serve
```

### "Model not found"
```bash
# Download the model first
ollama pull llama2
```

### Slow responses
- Use a smaller model: `ollama pull phi`
- Update .env: `OLLAMA_MODEL=phi`

### Out of memory
- Close other apps
- Use smaller model (phi)
- Check: `ollama list` to see installed models

## 🎯 Benefits of Ollama

✅ **Completely Free** - No API costs
✅ **Offline** - Works without internet
✅ **Private** - Data stays on your machine
✅ **Fast** - Once model is loaded
✅ **No Rate Limits** - Use as much as you want

## 🔗 Resources

- Ollama Website: https://ollama.com/
- Available Models: https://ollama.com/library
- GitHub: https://github.com/ollama/ollama

## 💡 Tips

1. Keep `ollama serve` running in background
2. First query is slower (model loads into RAM)
3. Subsequent queries are much faster
4. Models stay in memory for ~5 minutes after last use
5. You can run multiple models, but only one at a time

## 🆚 vs OpenAI GPT-3.5

**Ollama (llama2):**
- ✅ Free
- ✅ Offline
- ✅ Private
- ❌ Slower first response
- ❌ Less sophisticated

**OpenAI GPT-3.5:**
- ✅ Very fast
- ✅ More sophisticated
- ❌ Costs money ($)
- ❌ Requires internet
- ❌ Data sent to OpenAI

For this lab assignment, **Ollama is perfect** - it's free, works offline, and is "good enough" for travel recommendations!

