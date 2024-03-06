export function crossover(first: Float32Array, second: Float32Array, prob = 0.25): Float32Array {
    return new Float32Array(first.map((w, i) => Math.random() < prob ? second[i] : w))
}

export function mutate(master: Float32Array, prob = 0.25, delta = 0.5): Float32Array {
    return new Float32Array(master.map(w => Math.random() < prob ? w + (Math.random() * delta - (delta / 2)) : w))
}

export function createNew(size: number, delta = 4): Float32Array {
    return new Float32Array(size).map(() => Math.random() * delta - (delta / 2));
}

export function createEmpty(size: number): Float32Array {
    return new Float32Array(size);
}
