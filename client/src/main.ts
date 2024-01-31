import {Board} from "./board.ts";

const game = new Board('#app');

document.querySelector('#game').addEventListener('click', async () => {
    const depth = parseInt((document.querySelector('#depth') as HTMLInputElement).value, 10);

    const file = await game.asPng(`game_000.png`)
    download(`game_000.png`, file)

    let i = 1;
    while (!game.gameOver() && i < 300) {
        game.move(depth);
        console.log('epoch', i, game.gameOver());
        game.drawScore();

        const file = await game.asPng(`game_${i.toString().padStart(3, '0')}.png`)
        download(`game_${i.toString().padStart(3, '0')}.png`, file)
        console.log('board', game.fen(), game.gameOver())
        await new Promise((resolve) => setTimeout(resolve, 1000));
        i += 1;

    }
});

function download(name: string, data: string) {
    const a = document.createElement("a"); //Create <a>
    a.href = data;
    a.download = name
    a.click();
}