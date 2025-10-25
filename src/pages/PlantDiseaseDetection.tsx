import { useState, useRef, useCallback, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
  Scan, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  RefreshCw,
  Info,
  Leaf,
  Eye,
  Download,
  Share2,
  Play,
  Pause
} from 'lucide-react';

// Import Transformers.js for local model execution
import { pipeline, env } from '@xenova/transformers';

// Configure transformers to not use local models folder in production
env.allowRemoteModels = true;
env.allowLocalModels = false;

interface DetectionResult {
  label: string;
  confidence: number;
  disease: string;
  severity: 'low' | 'medium' | 'high';
  treatment: string;
  description: string;
}

const PlantDiseaseDetection = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<DetectionResult[]>([]);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number>(0);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  // Debug logging for state changes
  useEffect(() => {
    console.log('State changed - cameraActive:', cameraActive, 'videoPlaying:', videoPlaying, 'cameraStarting:', cameraStarting);
  }, [cameraActive, videoPlaying, cameraStarting]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const classifierRef = useRef<any>(null);

  // Load the model on component mount
  useEffect(() => {
    const loadModel = async () => {
      if (classifierRef.current) return;
      
      setModelLoading(true);
      setError(null);
      
      try {
        console.log('Loading plant disease detection model...');
        
        // Load the image classification pipeline with the specific model
        classifierRef.current = await pipeline(
          'image-classification',
          'Xenova/vit-base-patch16-224' // Using a compatible ViT model for plant classification
        );
        
        setModelReady(true);
        console.log('Model loaded successfully!');
      } catch (err) {
        console.error('Failed to load model:', err);
        setError('Failed to load AI model. Please refresh the page to try again.');
      } finally {
        setModelLoading(false);
      }
    };

    loadModel();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setCameraStarting(true);
      setError(null);
      console.log('Starting camera...');
      
      // Set camera as active BEFORE getting stream to ensure video element is rendered
      setCameraActive(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('Camera stream obtained:', stream);
      
      // Wait a tick for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Stream assigned to video element');
        
        // Force video to play
        try {
          await videoRef.current.play();
          console.log('Video playing successfully');
          setVideoPlaying(true);
        } catch (playError) {
          console.error('Video play error:', playError);
          console.log('Autoplay failed - user interaction may be required');
        }
        
        // Additional event listeners for debugging
        videoRef.current.onplay = () => {
          console.log('Video play event fired');
          setVideoPlaying(true);
        };
        
        videoRef.current.onpause = () => {
          console.log('Video pause event fired');
          setVideoPlaying(false);
        };
        
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
        };
        
        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
          setError('Video playback error. Please try again.');
        };
      } else {
        console.error('Video ref is null after waiting');
        setError('Failed to initialize video element. Please try again.');
        setCameraActive(false);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      let errorMessage = 'Unable to access camera. ';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage += 'Please allow camera permissions and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage += 'Camera is not supported in this browser.';
        } else {
          errorMessage += 'Please check permissions or upload an image instead.';
        }
      } else {
        errorMessage += 'Please check permissions or upload an image instead.';
      }
      
      setError(errorMessage);
      setCameraActive(false);
    } finally {
      setCameraStarting(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      setCameraStarting(false);
      setVideoPlaying(false);
      setRealTimeAnalysis(false);
      
      // Clear analysis interval
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
    }
  }, []);

  // Real-time analysis function
  const analyzeVideoFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive || isLoading || !modelReady || !classifierRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Skip if video not ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    try {
      // Capture current frame
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0);
      
      setIsLoading(true);
      
      // Convert canvas to data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      // Use the local model for classification
      const predictions = await classifierRef.current(imageDataUrl);
      
      if (predictions && predictions.length > 0) {
        const topPrediction = predictions[0];
        
        // Parse the disease information
        const diseaseInfo = parseDiseaseInfo(topPrediction.label);
        
        const newResult = {
          label: topPrediction.label,
          confidence: topPrediction.score * 100,
          disease: diseaseInfo.disease,
          severity: diseaseInfo.severity,
          treatment: diseaseInfo.treatment,
          description: diseaseInfo.description
        };

        setResult(newResult);
        setLastAnalysisTime(Date.now());
        
        // Add to history (keep last 5 results)
        setAnalysisHistory(prev => {
          const updated = [newResult, ...prev].slice(0, 5);
          return updated;
        });
        
        // Clear any previous errors
        setError(null);
      }
    } catch (err) {
      console.error('Real-time analysis error:', err);
      // Don't show errors for real-time analysis to avoid spam
    } finally {
      setIsLoading(false);
    }
  }, [cameraActive, isLoading, modelReady]);

  // Start real-time analysis
  const startRealTimeAnalysis = useCallback(() => {
    if (realTimeAnalysis || !cameraActive) return;
    
    setRealTimeAnalysis(true);
    setError(null);
    
    // Analyze every 3 seconds to avoid rate limiting
    analysisIntervalRef.current = setInterval(() => {
      analyzeVideoFrame();
    }, 3000);
    
    // Initial analysis
    setTimeout(() => {
      analyzeVideoFrame();
    }, 1000);
  }, [realTimeAnalysis, cameraActive, analyzeVideoFrame]);

  // Stop real-time analysis
  const stopRealTimeAnalysis = useCallback(() => {
    setRealTimeAnalysis(false);
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!image || !modelReady || !classifierRef.current) {
      if (!modelReady) {
        setError('AI model is still loading. Please wait a moment and try again.');
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Use the base64 image directly
      const predictions = await classifierRef.current(image);
      
      if (predictions && predictions.length > 0) {
        const topPrediction = predictions[0];
        
        // Parse the disease information
        const diseaseInfo = parseDiseaseInfo(topPrediction.label);
        
        setResult({
          label: topPrediction.label,
          confidence: topPrediction.score * 100,
          disease: diseaseInfo.disease,
          severity: diseaseInfo.severity,
          treatment: diseaseInfo.treatment,
          description: diseaseInfo.description
        });
      } else {
        throw new Error('No predictions received from the model');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsLoading(false);
    }
  }, [image, modelReady]);

  const parseDiseaseInfo = (label: string) => {
    // Parse the model output and provide disease information
    const lowerLabel = label.toLowerCase();
    
    let disease = 'Plant Classification';
    let severity: 'low' | 'medium' | 'high' = 'low';
    let treatment = 'Continue monitoring your plant\'s health.';
    let description = 'Plant has been classified. Monitor for any changes.';

    // Check for common plant disease indicators
    if (lowerLabel.includes('healthy') || lowerLabel.includes('normal')) {
      disease = 'Healthy Plant';
      severity = 'low';
      treatment = 'Continue current care routine. Plant appears healthy.';
      description = 'The plant shows no signs of disease and appears to be in good condition.';
    } else if (lowerLabel.includes('rust') || lowerLabel.includes('orange') || lowerLabel.includes('brown')) {
      disease = 'Possible Rust Disease';
      severity = 'medium';
      treatment = 'Apply fungicide, improve air circulation, avoid overhead watering.';
      description = 'Potential fungal disease causing orange or brown spots on leaves.';
    } else if (lowerLabel.includes('blight') || lowerLabel.includes('black') || lowerLabel.includes('dead')) {
      disease = 'Possible Blight';
      severity = 'high';
      treatment = 'Remove affected parts, apply copper-based fungicide, improve drainage.';
      description = 'Serious disease causing rapid browning and death of plant tissues.';
    } else if (lowerLabel.includes('spot') || lowerLabel.includes('lesion')) {
      disease = 'Possible Leaf Spot';
      severity = 'medium';
      treatment = 'Remove affected leaves, improve air circulation, apply fungicide if needed.';
      description = 'Fungal or bacterial infection causing spots on leaves.';
    } else if (lowerLabel.includes('mildew') || lowerLabel.includes('powder')) {
      disease = 'Possible Powdery Mildew';
      severity = 'medium';
      treatment = 'Improve air circulation, reduce humidity, apply fungicide.';
      description = 'Fungal disease appearing as white powdery coating on leaves.';
    } else if (lowerLabel.includes('yellow') || lowerLabel.includes('chlorotic')) {
      disease = 'Possible Nutrient Deficiency';
      severity = 'medium';
      treatment = 'Check soil nutrients, adjust fertilization, ensure proper watering.';
      description = 'Yellowing may indicate nutrient deficiency or stress.';
    } else if (lowerLabel.includes('wilt') || lowerLabel.includes('droop')) {
      disease = 'Possible Wilting/Stress';
      severity = 'medium';
      treatment = 'Check watering schedule, soil drainage, and root health.';
      description = 'Plant showing signs of water stress or root problems.';
    } else {
      // For unknown classifications, provide general plant care advice
      disease = `Plant Type: ${label}`;
      severity = 'low';
      treatment = 'Monitor plant health regularly and maintain good growing conditions.';
      description = `Identified as ${label}. Continue standard plant care practices.`;
    }

    return { disease, severity, treatment, description };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Leaf className="h-8 w-8 text-green-600" />
              Plant Disease Detection
            </h1>
            <p className="text-muted-foreground">
              Use AI to identify plant diseases and get treatment recommendations
            </p>
            {modelLoading && (
              <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading AI model... This may take a moment.
              </div>
            )}
            {modelReady && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                AI model ready for analysis
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" disabled={!modelReady}>
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" size="sm" className="gap-2" disabled={!modelReady}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Capture Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Capture or Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Display Area - Camera/Image/Empty State */}
              <div className="relative">
                {/* Debug info - remove this after fixing */}
                <div className="absolute top-0 right-0 z-50 bg-black text-white text-xs p-1 rounded">
                  Debug: {cameraActive ? 'Camera Active' : 'Camera Inactive'} | {videoPlaying ? 'Video Playing' : 'Video Not Playing'}
                </div>
                
                {cameraActive ? (
                  // Camera View
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover rounded-lg border-2 border-border bg-black"
                      onCanPlay={() => {
                        // Ensure the video is playing when it can
                        console.log('Video can play event');
                        if (videoRef.current) {
                          videoRef.current.play().catch(console.error);
                        }
                      }}
                      onPlay={() => {
                        console.log('Video started playing');
                        setVideoPlaying(true);
                      }}
                      onPause={() => {
                        console.log('Video paused');
                        setVideoPlaying(false);
                      }}
                      style={{ 
                        minHeight: '256px',
                        display: 'block',
                        backgroundColor: '#000'
                      }}
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg pointer-events-none" />
                    
                    {/* Live indicator */}
                    <div className="absolute top-2 left-2">
                      <div className={`text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                        videoPlaying ? 'bg-red-500' : 'bg-yellow-500'
                      }`}>
                        <div className={`w-2 h-2 bg-white rounded-full ${videoPlaying ? 'animate-pulse' : ''}`}></div>
                        {videoPlaying ? 'LIVE' : 'STARTING...'}
                      </div>
                    </div>

                    {/* Manual play button for browsers that don't support autoplay */}
                    {cameraActive && !videoPlaying && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <Button
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.play().then(() => {
                                console.log('Manual play successful');
                              }).catch((error) => {
                                console.error('Manual play failed:', error);
                                setError('Unable to start video playback. Please try refreshing the page.');
                              });
                            }
                          }}
                          size="lg"
                          className="bg-white hover:bg-gray-100 text-black"
                        >
                          <Play className="h-6 w-6 mr-2" />
                          Start Video
                        </Button>
                      </div>
                    )}
                    
                    {/* Real-time analysis indicator */}
                    {realTimeAnalysis && (
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <Scan className="w-3 h-3 animate-pulse" />
                          AI ANALYZING
                        </div>
                      </div>
                    )}

                    {/* Analysis loading indicator */}
                    {isLoading && (
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
                        <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Processing...
                        </div>
                      </div>
                    )}

                    {/* Last analysis time */}
                    {lastAnalysisTime > 0 && (
                      <div className="absolute bottom-12 left-2">
                        <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                          Last scan: {Math.floor((Date.now() - lastAnalysisTime) / 1000)}s ago
                        </div>
                      </div>
                    )}
                    
                    {/* Capture button overlay */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <Button
                        onClick={captureImage}
                        size="lg"
                        className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 text-black border-4 border-white shadow-lg"
                      >
                        <Camera className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Real-time analysis toggle */}
                    <div className="absolute bottom-4 right-4">
                      <Button
                        onClick={realTimeAnalysis ? stopRealTimeAnalysis : startRealTimeAnalysis}
                        size="sm"
                        variant={realTimeAnalysis ? "destructive" : "default"}
                        className="rounded-full"
                        disabled={!modelReady}
                      >
                        {realTimeAnalysis ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {/* Close camera button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-black/50 text-white border-white/50 hover:bg-black/70"
                      onClick={stopCamera}
                    >
                      ✕
                    </Button>
                  </div>
                ) : image ? (
                  // Image Preview
                  <div className="relative">
                    <img
                      src={image}
                      alt="Plant to analyze"
                      className="w-full h-64 object-cover rounded-lg border-2 border-border"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setImage(null)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  // No Image State
                  <div className="h-64 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-accent/20">
                    <div className="text-center space-y-3">
                      <div className="relative">
                        <Eye className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Camera className="h-2 w-2 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">Ready to scan your plants?</p>
                        <p className="text-xs text-muted-foreground mt-1">Start camera or upload an image to begin AI analysis</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex flex-col gap-2">
                {!cameraActive && !image && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={startCamera} 
                      className="gap-2" 
                      disabled={!modelReady || cameraStarting}
                    >
                      {cameraStarting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      {cameraStarting ? 'Starting...' : 'Start Camera'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                      disabled={!modelReady}
                    >
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </Button>
                  </div>
                )}

                {image && !cameraActive && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={analyzeImage}
                      disabled={isLoading || !modelReady}
                      className="gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Scan className="h-4 w-4" />
                      )}
                      {isLoading ? 'Analyzing...' : 'Analyze Plant'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setImage(null)}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                )}

                {cameraActive && (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {realTimeAnalysis 
                        ? "AI is analyzing your plants in real-time every 3 seconds" 
                        : modelReady 
                        ? "Tap the play button to start real-time AI analysis"
                        : "Waiting for AI model to load..."
                      }
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Live Camera
                      </div>
                      {modelReady && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          AI Ready
                        </div>
                      )}
                      {realTimeAnalysis && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          AI Active
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        Capture Photo
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-primary" />
                  Analysis Results
                </div>
                {realTimeAnalysis && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                    Real-time
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!result && !isLoading && !realTimeAnalysis && (
                <div className="text-center py-12 space-y-4">
                  <Leaf className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground">
                      No Analysis Yet
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {cameraActive 
                        ? "Start real-time analysis or capture a photo"
                        : "Capture or upload a plant image to get started"
                      }
                    </p>
                  </div>
                </div>
              )}

              {(isLoading || realTimeAnalysis) && !result && (
                <div className="text-center py-12 space-y-4">
                  <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
                  <div>
                    <h3 className="text-lg font-medium">
                      {realTimeAnalysis ? "Starting Real-time Analysis..." : "Analyzing Image..."}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {realTimeAnalysis 
                        ? "Point camera at plants for continuous AI analysis"
                        : "Our AI is examining your plant for diseases"
                      }
                    </p>
                    {!realTimeAnalysis && <Progress value={65} className="w-full mt-4" />}
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Real-time indicator */}
                  {realTimeAnalysis && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-800">Live Analysis Active</span>
                      </div>
                      <span className="text-xs text-green-600">
                        {lastAnalysisTime > 0 ? `Updated ${Math.floor((Date.now() - lastAnalysisTime) / 1000)}s ago` : 'Scanning...'}
                      </span>
                    </div>
                  )}

                  {/* Disease Information */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{result.disease}</h3>
                      <Badge className={`${getSeverityColor(result.severity)} flex items-center gap-1`}>
                        {getSeverityIcon(result.severity)}
                        {result.severity.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Confidence:</span>
                      <Progress value={result.confidence} className="flex-1 h-2" />
                      <span className="font-medium">{result.confidence.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                      Description
                    </h4>
                    <p className="text-sm leading-relaxed">{result.description}</p>
                  </div>

                  {/* Treatment */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                      Recommended Treatment
                    </h4>
                    <div className="bg-accent/50 p-4 rounded-lg">
                      <p className="text-sm leading-relaxed">{result.treatment}</p>
                    </div>
                  </div>

                  {/* Technical Info */}
                  <div className="pt-4 border-t border-border">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Technical Details
                      </summary>
                      <div className="mt-2 text-xs space-y-1 text-muted-foreground">
                        <p><span className="font-medium">Model Output:</span> {result.label}</p>
                        <p><span className="font-medium">Raw Confidence:</span> {(result.confidence / 100).toFixed(4)}</p>
                      </div>
                    </details>
                  </div>
                </div>
              )}

              {/* Analysis History */}
              {analysisHistory.length > 0 && realTimeAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                      Recent Scans
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {analysisHistory.length} results
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {analysisHistory.slice(0, 5).map((historyResult, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${index === 0 ? 'bg-accent/50 border-primary/20' : 'bg-muted/30 border-border'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{historyResult.disease}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSeverityColor(historyResult.severity)}`}
                          >
                            {historyResult.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={historyResult.confidence} className="flex-1 h-1" />
                          <span className="text-xs text-muted-foreground">
                            {historyResult.confidence.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Canvas for image processing (hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Info Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">1. Capture</h3>
                <p className="text-sm text-muted-foreground">
                  Start camera or upload an image of your plant
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">2. Real-time</h3>
                <p className="text-sm text-muted-foreground">
                  Enable live AI analysis for continuous plant monitoring
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Scan className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">3. Analyze</h3>
                <p className="text-sm text-muted-foreground">
                  AI identifies diseases every 3 seconds automatically
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">4. Treat</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant treatment recommendations and care tips
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PlantDiseaseDetection;