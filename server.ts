import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization for Google GenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    entity: 'The House Eighth / 8-th Inc',
    platform: 'Reconstruction of Future',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 8D Dimension Strata Deep AI Analysis Endpoint
app.post('/api/analyze-strata', async (req, res) => {
  try {
    const {
      siteName,
      location,
      coordinates,
      historicalLayer,
      modernFoundation,
      spectralFilter,
      activeDimensions,
      conflictDetected,
      shearStressMPa,
      moistureSaturationPct,
      soilStrata,
    } = req.body;

    const ai = getGenAI();

    if (!ai) {
      // Deterministic engineering fallback if API key is not yet set
      return res.json({
        analysis: `[THE HOUSE EIGHTH ARCHITECTURAL CORE - HEURISTIC SIMULATION]\n` +
          `Subterranean Tomography for ${siteName || 'Metropolitan Site'}:\n` +
          `• Target Coordinate: [X:${coordinates?.x ?? 42.4}m, Y:${coordinates?.y ?? 18.2}m, Z:${coordinates?.z ?? -12.5}m]\n` +
          `• Historical Horizon: ${historicalLayer?.name || 'Ancient Roman Ashlar Wall'} (~${historicalLayer?.century || '1st-2nd Century'})\n` +
          `• Modern Structural Interface: ${modernFoundation?.type || 'Bored Cast-in-place Concrete Pile #B-108'}\n` +
          `• Conflict Status: ${conflictDetected ? 'CRITICAL INTERSECTION DETECTED (Axial offset: 0.38m)' : 'Clearance nominal (>1.2m)'}\n` +
          `• Recommended Intervention: Implement jet-grouting perimeter envelope with micro-piles drilled tangential to ancient limestone masonry.\n` +
          `• 8D Reconstruction Forecast: Preserves 98.4% of intact archaeological fabric while maintaining 100% of modern superstructure load transfer requirement (${shearStressMPa || '4.2'} MPa shear rating).`,
        restorationProtocol: 'Venice Charter & ICOMOS compliant non-destructive underpinning',
        structuralSafetyIndex: conflictDetected ? 74 : 96,
        isSimulated: true,
      });
    }

    const prompt = `You are the lead architectural restoration scientist and structural engineer at "The House Eighth" (8-th Inc - Reconstruction of Future).
Your task is to analyze an 8D Dimension X-Ray scan overlaying ancient foundation data onto modern structural blueprints.

SCAN TELEMETRY:
- Site: ${siteName} (${location})
- Coordinate: X=${coordinates?.x}m, Y=${coordinates?.y}m, Depth Z=${coordinates?.z}m
- Historical Foundation Layer: ${historicalLayer?.name} (${historicalLayer?.epoch}, Material: ${historicalLayer?.material}, Thickness: ${historicalLayer?.thicknessM}m)
- Modern Structural Blueprint Component: ${modernFoundation?.type} (Capacity: ${modernFoundation?.loadKN} kN, Material: ${modernFoundation?.material})
- Geological Strata: ${soilStrata} (Moisture: ${moistureSaturationPct}%, Shear Stress: ${shearStressMPa} MPa)
- X-Ray Scanning Filter: ${spectralFilter}
- Active 8D Dimensions: ${(activeDimensions || []).join(', ')}
- Intersection Conflict Detected: ${conflictDetected ? 'YES - Direct structural collision/load interference' : 'NO - Buffer maintained'}

Provide a rigorous, concise architectural and engineering assessment structured in 4 sections:
1. 8D X-RAY STRATIGRAPHIC SYNTHESIS: Interpret the physical coexistence of the ancient foundation and modern blueprint.
2. STRUCTURAL RESILIENCE & CONFLICT AUDIT: Detail load distribution, settlement risks, and seismic coupling.
3. CONSERVATION INTERVENTION DIRECTIVE: Non-invasive engineering techniques (e.g. pneumatic micro-piling, cantilever grade beams, lime-pozzolana consolidation, elastomeric dampers).
4. RECONSTRUCTION OF FUTURE PERSPECTIVE: How this hybrid architectural symbiosis honors ancient heritage while enabling ultra-durable futuristic urban longevity.`;

    // Call Gemini with timeout fallback
    const geminiPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const timeoutPromise = new Promise<{ text: string }>((_, reject) => {
      setTimeout(() => reject(new Error('AI generation timed out')), 4000);
    });

    let analysisText = '';
    let isSimulated = false;

    try {
      const response = await Promise.race([geminiPromise, timeoutPromise]) as any;
      analysisText = response.text || '';
    } catch (apiErr) {
      console.warn('Gemini call failed or timed out, utilizing deterministic engineering fallback:', apiErr);
      isSimulated = true;
      analysisText = `[THE HOUSE EIGHTH ARCHITECTURAL CORE - STRATIGRAPHIC SYNTHESIS]\n\n` +
        `1. 8D X-RAY STRATIGRAPHIC SYNTHESIS:\n` +
        `At target coordinate [X:${coordinates?.x ?? 14}m, Y:${coordinates?.y ?? 13.5}m, Z:${coordinates?.z ?? -12.4}m], subterranean imaging reveals an authentic ${historicalLayer?.epoch || 'Ancient'} horizon (${historicalLayer?.name || 'Ashlar Masonry'}) embedded in ${soilStrata || 'pozzolanic fill'}.\n\n` +
        `2. STRUCTURAL RESILIENCE & CONFLICT AUDIT:\n` +
        `${conflictDetected ? 'CRITICAL INTERSECTION IDENTIFIED: The proposed modern bored pile trajectory intersects historic masonry headers. Point stress concentration exceeds 6.8 MPa without intervention.' : 'Clearance buffer verified nominal (>1.5m offset). Dynamic load transfer path is safely isolated from historic strata.'}\n\n` +
        `3. CONSERVATION INTERVENTION DIRECTIVE:\n` +
        `• Deploy non-vibratory rotary micro-piles tangential to archaeological perimeter.\n` +
        `• Install post-tensioned bridge grade beam with dual elastomeric neoprene dampening pads to isolate 100% of modern superstructure vibrations.\n` +
        `• Maintain subterranean moisture equilibrium with breathable lime-pozzolana grout jackets.\n\n` +
        `4. RECONSTRUCTION OF FUTURE PERSPECTIVE:\n` +
        `Enables The House Eighth to erect a 48-story modern timber-steel superstructure while converting the ancient foundation vault into a subterranean public heritage crypt.`;
    }

    res.json({
      analysis: analysisText,
      restorationProtocol: 'ICOMOS Charter 8D Reversible Preservation Standard',
      structuralSafetyIndex: conflictDetected ? 72 : 96,
      isSimulated,
    });
  } catch (error: any) {
    console.error('Strata analysis error:', error);
    res.status(500).json({
      error: error.message || 'Internal strata analysis failed',
      fallbackAdvice: 'Ensure structural clearance buffer of >= 1.5m from ancient masonry headers.',
    });
  }
});

// Vite middleware or production static serving
async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The House Eighth server running on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
