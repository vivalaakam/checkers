export type FEN = {
    move: 'B' | 'W',
    white: string[],
    black: string[],
}


export type ABScore = {
    score: number,
    path: string[],
}
