import natural from "natural";
import nlp from "compromise";

// =========================================================================
// 1. MULTI-LAYER PERCEPTRON (MLP) NEURAL NETWORK IMPLEMENTATION
// =========================================================================
export class MultiLayerPerceptron {
  private weights1: number[][]; // Input dimension -> Hidden dimension
  private bias1: number[];
  private weights2: number[][]; // Hidden dimension -> Output dimension
  private bias2: number[];

  private hiddenActivations: number[] = [];
  private outputActivations: number[] = [];

  constructor(
    public inputDim: number = 5,    // [volatility, cvdTrend, orderBookImbalance, priceChange, liquidityProximity]
    public hiddenDim: number = 10,  // Deep neuron density
    public outputDim: number = 1,   // Class probability (e.g., > 0.5 Bullish, <= 0.5 Bearish)
    public learningRate: number = 0.08
  ) {
    // Xavier / Glorot Normal Initialization: range [-limit, +limit] where limit = sqrt(6 / (fan_in + fan_out))
    const limit1 = Math.sqrt(6.0 / (inputDim + hiddenDim));
    this.weights1 = Array.from({ length: hiddenDim }, () =>
      Array.from({ length: inputDim }, () => (Math.random() * 2 - 1) * limit1)
    );
    this.bias1 = Array(hiddenDim).fill(0).map(() => (Math.random() * 0.2 - 0.1));

    const limit2 = Math.sqrt(6.0 / (hiddenDim + outputDim));
    this.weights2 = Array.from({ length: outputDim }, () =>
      Array.from({ length: hiddenDim }, () => (Math.random() * 2 - 1) * limit2)
    );
    this.bias2 = Array(outputDim).fill(0).map(() => (Math.random() * 0.2 - 0.1));
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private sigmoidDerivative(sigValue: number): number {
    // Input sigValue is already passed through sigmoid, so d/dx(sigmoid) = sigmoid(x)*(1 - sigmoid(x))
    return sigValue * (1 - sigValue);
  }

  /**
   * Feedforward Phase
   */
  public forward(inputs: number[]): number[] {
    // Ensure input vector matches the dimensions exactly
    const padInputs = Array(this.inputDim).fill(0);
    for (let i = 0; i < this.inputDim; i++) {
      if (i < inputs.length) padInputs[i] = inputs[i];
    }

    // Input to Hidden layer
    this.hiddenActivations = Array(this.hiddenDim).fill(0);
    for (let h = 0; h < this.hiddenDim; h++) {
      let sum = this.bias1[h];
      for (let i = 0; i < this.inputDim; i++) {
        sum += padInputs[i] * this.weights1[h][i];
      }
      this.hiddenActivations[h] = this.sigmoid(sum);
    }

    // Hidden to Output layer
    this.outputActivations = Array(this.outputDim).fill(0);
    for (let o = 0; o < this.outputDim; o++) {
      let sum = this.bias2[o];
      for (let h = 0; h < this.hiddenDim; h++) {
        sum += this.hiddenActivations[h] * this.weights2[o][h];
      }
      this.outputActivations[o] = this.sigmoid(sum);
    }

    return this.outputActivations;
  }

  /**
   * Supervised Backpropagation Phase (Stochastic Gradient Descent)
   * Returns calculated squared error for convergence tracking
   */
  public train(inputs: number[], targets: number[]): number {
    const outputs = this.forward(inputs);
    
    // Output error computation
    const outputGradients = Array(this.outputDim).fill(0);
    let totalError = 0;
    for (let o = 0; o < this.outputDim; o++) {
      const error = targets[o] - outputs[o];
      totalError += 0.5 * error * error;
      outputGradients[o] = error * this.sigmoidDerivative(outputs[o]);
    }

    // Hidden layer error computation
    const hiddenGradients = Array(this.hiddenDim).fill(0);
    for (let h = 0; h < this.hiddenDim; h++) {
      let errorSum = 0;
      for (let o = 0; o < this.outputDim; o++) {
        errorSum += outputGradients[o] * this.weights2[o][h];
      }
      hiddenGradients[h] = errorSum * this.sigmoidDerivative(this.hiddenActivations[h]);
    }

    // Update weights & biases: Hidden to Output
    for (let o = 0; o < this.outputDim; o++) {
      this.bias2[o] += this.learningRate * outputGradients[o];
      for (let h = 0; h < this.hiddenDim; h++) {
        this.weights2[o][h] += this.learningRate * outputGradients[o] * this.hiddenActivations[h];
      }
    }

    // Update weights & biases: Input to Hidden
    for (let h = 0; h < this.hiddenDim; h++) {
      this.bias1[h] += this.learningRate * hiddenGradients[h];
      for (let i = 0; i < this.inputDim; i++) {
        this.weights1[h][i] += this.learningRate * hiddenGradients[h] * (i < inputs.length ? inputs[i] : 0);
      }
    }

    return totalError;
  }
}

// Global active MLP instance mapping continuous order flow trends
export const liveMLPBrain = new MultiLayerPerceptron(5, 12, 1, 0.12);

// =========================================================================
// 2. ADVANCED NLP (NATURAL LANGUAGE PROCESSING) BRAIN SERVICES
// =========================================================================
const tokenizer = new natural.WordTokenizer();
const analyzer = new natural.SentimentAnalyzer("English", natural.PorterStemmer, "afinn");
const nounInflector = new natural.NounInflector();

export interface NLPParsedPrompt {
  tokens: string[];
  sentiment: number;
  entities: string[];
  intents: string[];
  keyNoun: string;
}

/**
 * Parses user input prompts linguistically, analyzing sentiment and targeting financial terms
 */
export function processNLPPrompt(prompt: string): NLPParsedPrompt {
  const normalized = (prompt || "").toLowerCase();
  
  // Natural Word Tokenization
  const tokens = tokenizer.tokenize(normalized) || [];
  
  // Natural Sentiment Analysis
  const sentiment = analyzer.getSentiment(tokens) || 0;
  
  // Compromise NLP parsing for high-fidelity grammatical entities
  const doc = nlp(prompt);
  const entities = doc.topics().out("array") as string[];
  const nouns = doc.nouns().out("array") as string[];
  
  // Guess primary financial target term
  let keyNoun = "liquidity fields";
  if (nouns.length > 0) {
    const candidate = nouns.find(n => n.length > 3 && !["price", "chart", "volume", "market", "trade", "quote", "order"].includes(n.toLowerCase()));
    if (candidate) {
      keyNoun = nounInflector.pluralize(candidate.toLowerCase());
    } else {
      keyNoun = nounInflector.pluralize(nouns[0].toLowerCase());
    }
  }

  // Detect semantic intents
  const intents: string[] = [];
  if (normalized.includes("volat") || normalized.includes("vix") || normalized.includes("squeeze")) {
    intents.push("volatility");
  }
  if (normalized.includes("cvd") || normalized.includes("delta") || normalized.includes("cumulative")) {
    intents.push("cvd_divergence");
  }
  if (normalized.includes("support") || normalized.includes("resist") || normalized.includes("level") || normalized.includes("pool")) {
    intents.push("support_resistance");
  }
  if (normalized.includes("order") || normalized.includes("book") || normalized.includes("imbalance") || normalized.includes("depth")) {
    intents.push("book_imbalance");
  }
  if (normalized.includes("predict") || normalized.includes("forecast") || normalized.includes("where") || normalized.includes("target")) {
    intents.push("mlp_prediction");
  }

  return {
    tokens,
    sentiment,
    entities,
    intents,
    keyNoun
  };
}

// =========================================================================
// 3. CONTINUOUS LEARNING PIPELINE & TRAINING WRAPPER (HEURISTIC)
// =========================================================================
interface HistoricTick {
  volatility: number;
  cvdTrend: number;
  orderBookImbalance: number;
  priceChange: number;
  liquidityProximity: number;
  priceClose: number;
}

// Circular buffer of market snapshots for continuous training
const SNAPSHOT_BUFFER_MAX = 50;
const snapshotBuffer: HistoricTick[] = [];
let totalTrainingEpochs = 0;
let averageTrainingLoss = 0.05;

/**
 * Records a tick snapshot and runs an online mini-batch gradient descent epoch
 * to train the MLP Brain against real price discovery patterns.
 */
export function recordTickAndTrainMLP(
  volatility: number,
  cvdTrend: number,
  orderBookImbalance: number,
  priceChange: number,
  liquidityProximity: number,
  priceClose: number
) {
  const currentSnap: HistoricTick = {
    volatility,
    cvdTrend,
    orderBookImbalance,
    priceChange,
    liquidityProximity,
    priceClose
  };

  // Push snapshot to the circular buffer
  snapshotBuffer.push(currentSnap);
  if (snapshotBuffer.length > SNAPSHOT_BUFFER_MAX) {
    snapshotBuffer.shift();
  }

  // Continuous online training: We look at matching historical snaps to price results
  // For a lookback period (e.g., check if price rose 10 periods later)
  const trainingLookback = 12;
  if (snapshotBuffer.length > trainingLookback + 2) {
    let lossSum = 0;
    let trainsCount = 0;

    for (let i = 0; i < snapshotBuffer.length - trainingLookback; i++) {
      const pastSnap = snapshotBuffer[i];
      const futureSnap = snapshotBuffer[i + trainingLookback];
      
      const priceDelta = futureSnap.priceClose - pastSnap.priceClose;
      
      // Feature Normalization (standardizing signals to general [-2, 2] range for sigmoid entry)
      const inputVector = [
        Math.min(2.5, Math.max(-2.5, pastSnap.volatility * 100)),
        Math.min(2.5, Math.max(-2.5, pastSnap.cvdTrend / 1500)),
        Math.min(2.5, Math.max(-2.5, (pastSnap.orderBookImbalance - 0.5) * 5)),
        Math.min(2.5, Math.max(-2.5, pastSnap.priceChange * 300)),
        Math.min(2.5, Math.max(-2.5, pastSnap.liquidityProximity * 200))
      ];

      // Target criteria: 1.0 if price went positive, 0.0 if negative, 0.5 if flat
      const targetLabel = priceDelta > 0.00001 ? 1.0 : priceDelta < -0.00001 ? 0.0 : 0.5;

      const loss = liveMLPBrain.train(inputVector, [targetLabel]);
      lossSum += loss;
      trainsCount++;
    }

    if (trainsCount > 0) {
      totalTrainingEpochs += trainsCount;
      averageTrainingLoss = (averageTrainingLoss * 0.95) + ((lossSum / trainsCount) * 0.05);
    }
  }
}

/**
 * Returns current statistics of the live learning brain
 */
export function getBrainTelemetry() {
  return {
    neuronsActive: liveMLPBrain.hiddenDim,
    totalTrainingEpochs,
    meanSquaredError: averageTrainingLoss,
    weightsCoefficients: liveMLPBrain.inputDim * liveMLPBrain.hiddenDim + liveMLPBrain.hiddenDim * liveMLPBrain.outputDim,
    mLLVocabCount: liveMLLBrain.getVocabSize(),
  };
}

// =========================================================================
// 4. MICRO LANGUAGE LEARNER (mLL) GENERATIVE TRANSITION ENGINE
// =========================================================================
export class MicroLanguageLearner {
  private transitionMatrix: Map<string, Map<string, number>> = new Map();
  private startingWords: string[] = [];

  constructor() {
    this.seedCorporateCorpus();
  }

  private seedCorporateCorpus() {
    const corpus = [
      "institutional accumulation patterns absorb passive selling at key liquidity walls",
      "systemic order book imbalances forecast immediate volatility breakout events",
      "cumulative volume delta divergences confirm hidden absorption near support levels",
      "active tectonic stress fields contract as buyers defend active zone limits",
      "zero latency mathematical loops verify micro velocity trends strictly bearish biased",
      "sovereign block trades execute discreetly to mitigate aggressive tape slippage",
      "high density bid walls dynamic support wicks and passive absorption blocks expand",
      "continuous online neural updates sync dense connected coefficients during wicks",
      "market sentiment shifts rapidly under structural compression vectors",
      "synthesizing orderbook delta anomalies reveals institutional liquidity pools",
      "algorithmic liquidity expansion bypasses traditional resistance wicks perfectly",
      "intelligent smartness propagates through multi layer perceptrons cleanly"
    ];

    corpus.forEach(sentence => this.trainText(sentence));
  }

  public trainText(text: string) {
    if (!text) return;
    const words = text.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 0);

    if (words.length === 0) return;
    
    if (words[0].length > 3) {
      this.startingWords.push(words[0]);
    }

    for (let i = 0; i < words.length - 1; i++) {
      const current = words[i];
      const next = words[i + 1];

      if (!this.transitionMatrix.has(current)) {
        this.transitionMatrix.set(current, new Map());
      }
      const targets = this.transitionMatrix.get(current)!;
      targets.set(next, (targets.get(next) || 0) + 1);
    }
  }

  public getVocabSize(): number {
    return this.transitionMatrix.size;
  }

  public generate(seedWord?: string, minLength: number = 6): string {
    let current = seedWord?.toLowerCase() || "";
    
    if (!current || !this.transitionMatrix.has(current)) {
      if (this.startingWords.length > 0) {
        current = this.startingWords[Math.floor(Math.random() * this.startingWords.length)];
      } else {
        current = "institutional";
      }
    }

    const result: string[] = [current];

    for (let i = 0; i < 20; i++) {
      const targets = this.transitionMatrix.get(current);
      if (!targets || targets.size === 0) {
        break;
      }

      let totalFreq = 0;
      for (const freq of targets.values()) {
        totalFreq += freq;
      }

      let r = Math.random() * totalFreq;
      let nextWord = "";
      for (const [word, freq] of targets.entries()) {
        r -= freq;
        if (r <= 0) {
          nextWord = word;
          break;
        }
      }

      if (!nextWord) break;
      result.push(nextWord);
      current = nextWord;

      if (result.length >= minLength && Math.random() > 0.72) {
        break;
      }
    }

    const sentence = result.join(" ");
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
  }
}

export const liveMLLBrain = new MicroLanguageLearner();
