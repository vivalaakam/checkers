import { createEmpty, createNew } from "./genetic";

export enum Activation {
  Sigmoid,
  Relu,
}

class Layer {
  weights: Float32Array;
  biases: Float32Array;
  inputCount: number;
  outputCount: number;
  size: number;
  activation: Activation;

  /**
   * Create a new layer
   * @param inputCount
   * @param outputCount
   * @param activation
   */
  constructor(
    inputCount: number,
    outputCount: number,
    activation: Activation = Activation.Relu
  ) {
    this.inputCount = inputCount;
    this.outputCount = outputCount;
    this.weights = createNew(inputCount * outputCount, 2);
    this.biases = createNew(outputCount, 2);
    this.activation = activation;

    this.size = inputCount * outputCount + outputCount;
    switch (activation) {
      case Activation.Sigmoid:
        this.activate = this.activateSigmoid.bind(this);
        break;
      case Activation.Relu:
        this.activate = this.activationRelu.bind(this);
        break;
    }
  }

  /**
   * Activation function (identity)
   * @param val
   */
  activate(val: Float32Array) {
    return val;
  }

  /**
   * Activation function (sigmoid)
   * @param val
   */
  activateSigmoid(val: Float32Array) {
    return val.map((v) => 1 / (1 + Math.exp(-v)));
  }

  /**
   * Activation function (relu)
   * @param val
   */
  activationRelu(val: Float32Array) {
    return val.map((v) => Math.max(0, v));
  }

  /**
   * Predict an output
   * @param inputs
   */
  predict(inputs: Float32Array) {
    let result = createEmpty(this.outputCount);

    for (let i = 0; i < this.outputCount; i++) {
      for (let j = 0; j < this.inputCount; j++) {
        result[i] += inputs[j] * this.weights[i * this.inputCount + j];
      }
      result[i] += this.biases[i];
    }

    return this.activate(result);
  }

  /**
   * Get the weights of the layer
   */
  getWeights() {
    return Float32Array.from([...this.weights, ...this.biases]);
  }

  /**
   * Gst current layer topology
   */
  getTopology() {
    return new Float32Array([
      this.inputCount,
      this.activation,
      this.outputCount,
    ]);
  }

  /**
   * Set the weights of the layer
   * @param weights
   */
  setWeights(weights: Float32Array) {
    this.weights = weights.slice(0, this.weights.length);
    this.biases = weights.slice(this.weights.length);
  }
}

export class Network {
  network: Layer[] = [];
  inputs: any;
  outputs: any;

  /**
   * Create a new network
   * @param inputs
   * @param outputs
   * @param layer
   */
  constructor(inputs: number, outputs: number, layer: (number[] | Layer)[]) {
    this.inputs = inputs;
    this.outputs = outputs;

    for (const layerSize of layer) {
      const l =
        layerSize instanceof Layer
          ? layerSize
          : new Layer(layerSize[0], layerSize[2], layerSize[1]);
      this.network.push(l);
    }
  }

  /**
   * Predict an output
   * @param input
   */
  predict(input: Float32Array) {
    return this.network.reduce((acc, layer) => layer.predict(acc), input);
  }

  /**
   * Get topology for whole network
   */
  getTopology() {
    return new Float32Array(
      [
        this.inputs,
        this.outputs,
        this.network.length,
        ...this.network.map((layer) => [...layer.getTopology()]),
      ].flat()
    );
  }

  /**
   * Get the weights of the network
   */
  getWeights() {
    return this.network.reduce((acc, layer) => {
      return new Float32Array([...acc, ...layer.getWeights()]);
    }, new Float32Array([]));
  }

  /**
   * Set the weights of the network
   * @param weights
   */
  setWeights(weights: Float32Array) {
    let offset = 0;
    for (const layer of this.network) {
      layer.setWeights(weights.slice(offset, offset + layer.size));
      offset += layer.size;
    }
  }

  /**
   * Get the size of the network
   */
  size() {
    return this.network.reduce((acc, layer) => acc + layer.size, 0);
  }

  /**
   * Serialize the network
   */
  toBinary() {
    const topology = this.getTopology();

    const weights = new Float32Array(topology.length + this.size());
    weights.set(this.getTopology());
    weights.set(this.getWeights(), topology.length);

    return Buffer.from(weights.buffer);
  }

  /**
   * Create a network from a binary
   * @param json
   * @param weights
   */
  static fromBinary(buffer: Float32Array) {
    const inputs = buffer[0];
    const outputs = buffer[1];
    const length = buffer[2];

    const layers = Array.from({ length }).map((_, i) => {
      const start = 3 + i * 3;
      const end = start + 3;
      const topology = buffer.subarray(start, end);
      return new Layer(topology[0], topology[2], topology[1]);
    });

    const network = new Network(inputs, outputs, layers);

    network.setWeights(buffer.subarray(3 + length * 3));

    return network;
  }
}
