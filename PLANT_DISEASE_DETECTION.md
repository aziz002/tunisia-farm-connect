# Plant Disease Detection Setup

# Plant Disease Detection Setup

## Overview
The Plant Disease Detection feature uses AI to identify plant diseases from camera images or uploaded photos. It uses **Transformers.js** to run AI models directly in your browser, providing fast, offline analysis without API dependencies or rate limits.

## Setup Instructions

### 1. Installation
The required AI libraries are already included when you run:
```bash
npm install
```

### 2. No API Keys Required! 
✅ **The model runs locally in your browser** - no Hugging Face API token needed!
✅ **Works offline** once the model is downloaded
✅ **No rate limits** or API costs
✅ **Privacy-first** - images never leave your device

### 3. First Run
- The AI model will download automatically on first use (this may take 1-2 minutes)
- Subsequent uses will be instant as the model is cached
- You'll see a "Loading AI model..." indicator during initial setup

### 4. Features
- **🚀 Local AI Processing**: Models run directly in your browser using WebGL acceleration
- **📱 Real-time Camera Analysis**: Continuous AI analysis of live camera feed every 3 seconds
- **📷 Camera Integration**: Use your device's camera to capture plant images
- **📁 File Upload**: Upload existing plant photos for analysis
- **🔬 Advanced AI Detection**: Powered by Vision Transformer (ViT) models
- **💊 Treatment Recommendations**: Get actionable advice for plant care
- **📊 Confidence Scoring**: See how confident the AI is in its diagnosis
- **⚠️ Severity Classification**: Understand the urgency of the detected issues
- **📈 Analysis History**: Track recent scans during real-time sessions
- **🔴 Live Indicators**: Visual feedback for camera status and AI activity
- **🔒 Privacy-First**: All processing happens locally - no data leaves your device

### 4. Supported Browsers
The camera feature requires modern browsers with camera API support:
- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 12+

### 5. Usage Tips
- **Real-time Analysis**: 
  - Point camera at plants and tap the play button for continuous monitoring
  - Move camera slowly to different plants for comprehensive scanning
  - Analysis runs every 3 seconds to avoid API rate limits
- **Photo Quality**: 
  - Take clear, well-lit photos of affected plant parts
  - Ensure the diseased area is clearly visible
  - Avoid blurry or dark images for best results
  - Include some healthy plant tissue for comparison when possible
- **Camera Tips**:
  - Hold device steady during real-time analysis
  - Ensure good lighting conditions
  - Position plants 6-12 inches from camera for optimal results

### 6. Privacy & Security
- Images are processed through Hugging Face's inference API
- No images are stored permanently on our servers
- Your Hugging Face token is kept secure in environment variables
- Consider the privacy implications when using sensitive plant data

## Troubleshooting

### Model Loading Issues
- **First-time setup**: The AI model downloads automatically (50-100MB) - ensure good internet connection
- **Slow loading**: Large models may take 1-2 minutes on first use
- **Browser compatibility**: Requires modern browser with WebGL support (Chrome 70+, Firefox 65+, Safari 14+)
- **Memory issues**: Ensure browser has enough RAM (4GB+ recommended for smooth operation)

### Camera Not Working
- Check browser permissions for camera access
- Ensure you're using HTTPS (required for camera API)
- Try refreshing the page
- Use the upload option as an alternative

### Performance Issues
- **Slow analysis**: Enable hardware acceleration in browser settings
- **WebGL errors**: Update your graphics drivers
- **Memory warnings**: Close other tabs to free up RAM
- **Model not loading**: Clear browser cache and reload

### Analysis Results
- **Low confidence**: The model provides best-effort classification for plant images
- **General classifications**: Model may classify plant types rather than specific diseases
- **False positives**: Always cross-reference results with agricultural experts
- **Continuous improvement**: Results improve with better image quality and lighting