# AI Presentation Generator - Setup Guide

This document explains how to set up and use the AI-powered presentation generation feature.

## Overview

The AI Presentation Generator uses Anthropic's Claude API to create complete presentations from simple text prompts. Users can describe what presentation they want, and the AI will generate:

- A catchy title
- Multiple slides with content
- Professionally positioned text elements
- Appropriate color schemes and layouts

## Setup Instructions

### 1. Install Dependencies

Install the required Python package:

```bash
pip install anthropic
```

Or install all requirements:

```bash
pip install -r requirements.txt
```

### 2. Get Anthropic API Key

1. Sign up for an Anthropic account at https://console.anthropic.com/
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (it starts with `sk-ant-`)

### 3. Set Environment Variable

Set the `ANTHROPIC_API_KEY` environment variable:

**On Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY="your-api-key-here"
```

**On Windows (CMD):**
```cmd
set ANTHROPIC_API_KEY=your-api-key-here
```

**On Linux/Mac:**
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

**For persistent configuration**, add to your `.env` file (create if doesn't exist):
```
ANTHROPIC_API_KEY=your-api-key-here
```

Then load it in your Django settings (already configured in `settings.py`).

### 4. Restart Django Server

After setting the environment variable, restart your Django server:

```bash
python manage.py runserver
```

## Usage

### From the UI

1. Go to the Presentations page (`/presentations`)
2. Click the **"Generate with AI"** button (purple gradient button)
3. In the dialog, describe your presentation:
   - Example: "Create a presentation about climate change solutions with focus on renewable energy"
   - Example: "Present our Q4 sales results and 2024 goals"
4. Optionally specify the number of slides (3-20)
5. Click **"Generate Presentation"**
6. Wait for the AI to generate the presentation (usually 5-15 seconds)
7. The presentation will be created and you can open it immediately

### From the API

**Endpoint:** `POST /api/ai/generate-full/`

**Headers:**
```
Authorization: Token <your-auth-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "Create a presentation about machine learning for beginners",
  "num_slides": 7
}
```

**Response:**
```json
{
  "presentation_id": 123,
  "title": "Introduction to Machine Learning",
  "num_frames": 7,
  "message": "Presentation generated successfully"
}
```

## How It Works

### Backend Flow

1. **API Endpoint** ([presentation_views.py:645](api/presentation_views.py#L645))
   - Receives user prompt and optional slide count
   - Validates input

2. **AI Service** ([ai_service.py](api/ai_service.py))
   - Sends prompt to Claude API with structured instructions
   - Claude generates JSON with presentation structure
   - Returns: title, description, frames with elements

3. **Database Creation**
   - Creates `Presentation` object
   - Creates `Frame` objects for each slide
   - Creates `Element` objects (text, shapes) for each frame
   - Sets up proper positioning, animations, transitions

### Frontend Flow

1. **AI Dialog** ([AIGenerateDialog.tsx](frontend/components/presentations/AIGenerateDialog.tsx))
   - User enters prompt
   - Sends request to backend
   - Shows loading state
   - Handles success/error

2. **Success Handler** ([page.tsx:116](frontend/app/presentations/page.tsx#L116))
   - Shows success notification
   - Option to open presentation immediately
   - Or refresh list to see new presentation

## Generated Presentation Structure

The AI creates presentations with:

### Slide Layouts
- **Title Slide**: Large centered text (64-72px)
- **Content Slides**: Title at top (48px) + body text (24-32px)
- **Conclusion Slide**: Summary and next steps

### Design Specifications
- **Canvas Size**: 1920x1080 pixels (standard HD)
- **Margins**: Minimum 100px from edges
- **Colors**: Professional color schemes
- **Fonts**: Arial, Helvetica, Times New Roman
- **Animations**: Fade transitions by default

### Element Positioning
- Titles: y: 100-200
- Body content: y: 300-400
- Proper z-index layering
- No overlap between elements

## Customization

### Modify AI Prompt Instructions

Edit the `system_prompt` in [ai_service.py:58](api/ai_service.py#L58) to change:
- Design guidelines
- Color schemes
- Font preferences
- Layout patterns

### Change AI Model

Edit [ai_service.py:115](api/ai_service.py#L115) to use a different Claude model:
```python
model="claude-3-5-sonnet-20241022",  # Current model
# or
model="claude-3-opus-20240229",      # More powerful
```

### Adjust Generation Parameters

In [ai_service.py:116-117](api/ai_service.py#L116-L117):
```python
max_tokens=4096,    # Increase for longer presentations
temperature=0.7,    # Lower for more consistent output
```

## Troubleshooting

### Error: "ANTHROPIC_API_KEY not configured"

**Solution:** Set the environment variable as described in step 3 above.

### Error: "Failed to generate presentation: Anthropic API error"

**Possible causes:**
- Invalid API key
- API key quota exceeded
- Network connectivity issues

**Solution:**
- Verify your API key is correct
- Check your Anthropic account credits
- Check internet connection

### Generated presentation has no content

**Possible cause:** AI returned unexpected format

**Solution:**
- Check Django logs for the actual AI response
- The JSON parsing might have failed
- Try a more specific prompt

### Slow generation

**Expected:** Generation typically takes 5-15 seconds for Claude to generate structured content.

**If longer:**
- Check your internet connection
- Anthropic API might be experiencing high load
- Consider using a faster model (claude-3-haiku)

## Example Prompts

Good prompts are specific and clear:

✅ **Good:**
- "Create a presentation about the benefits of remote work for tech companies, with slides on productivity, cost savings, and employee satisfaction"
- "Present our Q4 2024 sales results showing 25% growth, top products, and 2025 goals"
- "Introduction to Python programming for complete beginners, covering variables, loops, and functions"

❌ **Too vague:**
- "Make a presentation"
- "Something about business"
- "Tech stuff"

## API Cost Estimation

Anthropic Claude pricing (as of 2024):
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

Typical cost per presentation generation:
- Input tokens: ~500-1000 (prompt + system instructions)
- Output tokens: ~1000-2000 (presentation structure)
- **Estimated cost: $0.02-$0.05 per presentation**

## Files Modified/Created

### Backend
- ✅ [requirements.txt](requirements.txt) - Added `anthropic`
- ✅ [smarthack2025/settings.py](smarthack2025/settings.py) - Added `ANTHROPIC_API_KEY` config
- ✅ [api/ai_service.py](api/ai_service.py) - New AI service module
- ✅ [api/presentation_views.py](api/presentation_views.py) - Added `ai_generate_full_presentation` endpoint
- ✅ [api/presentation_urls.py](api/presentation_urls.py) - Added `/api/ai/generate-full/` route

### Frontend
- ✅ [components/presentations/AIGenerateDialog.tsx](frontend/components/presentations/AIGenerateDialog.tsx) - New dialog component
- ✅ [app/presentations/page.tsx](frontend/app/presentations/page.tsx) - Added AI generation button and dialog integration

## Next Steps

Potential enhancements:
1. Add image generation using DALL-E or Stable Diffusion
2. Support for different presentation styles (minimal, corporate, creative)
3. Template-based generation
4. Multi-language support
5. Voice-to-text prompt input
6. Presentation outline preview before full generation
7. Iterative refinement ("make the second slide more detailed")

## Support

For issues or questions:
- Check Django logs: `python manage.py runserver` output
- Check browser console for frontend errors
- Verify API key is set correctly
- Ensure all dependencies are installed

---

**Created:** 2025-11-09
**Last Updated:** 2025-11-09
