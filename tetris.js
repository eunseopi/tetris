const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 테트리스 블록을 회전시켜서 나오는 블록 최대크기는 4 x 4 이다. ---- <- 이 도형때문에
// const tetris_block = Array.from(Array(4), () => new Array(4).fill(0));
// -> 배열을 새로 만들어서 해보려고 했는데 직접 설정해서 하는게 편할 것 같아서 주석처리 !

// 테트리스 모양을 미리 배열로 만들어보기
// 각각의 배열을 만들어놓고 보니 for 문으로 접근하는 법이 좀 힘들어서
// 객체 형태로 저장을 해야겠다..
// => 그냥 배열로 저장해서 랜덤으로 불러오기로 결정

let tetris_shape = [
    // 사각형 모양
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    // L 모양
    [
        [0, 0, 0, 0],
        [0, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 0],
    ],
    // I 모양
    [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
    ],
    // T 모양
    [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 1],
        [0, 0, 0, 0],
    ],
    // Z 모양
    [
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
]

// 현재 : 만약 Z 모양이 현재 블록이고 다음 블록이 Z 면
// 회전을 했을 때 같이 돌아가는 현상이 발생
// -> 배열을 복사하지 않고, 참조만 하고 있어서 깊은 복사를 사용해야된다.
function deepCopy(block) {
    // block.map =>
    // [
    //      [...[0,0,0,0]],
    // ...
    // -> 행마다 새로운 배열로 복사!!
    return {
        shape: block.map(row => [...row]),
        basicShape: block.basicShape
    };
}

// 현재 모양 : shape
// 원본 모양 : basicShape
function getNewBlock() {
    const randomBlock = tetris_shape[Math.floor(Math.random() * tetris_shape.length)];
    return {
        // 랜덤 블록의 깊은 복사
        shape: deepCopy(randomBlock).shape,
        // 랜덤 블록의 원본 블록 참조
        basicShape: randomBlock
    };
}

// 2차원 배열을 돌릴 때, 이동되기 전 행의 열은 이동된 후의 행이 되고
// 이동되기 전 행은 이동된 후의 열에 2차원 배열의 최대 인덱스 - 이동되기 전의 행의 인덱스이다.
// 2차원 배열 돌려보기 연습.
// const shape = tetris_shape[1];
//
// let new_arr = Array.from(Array(shape.length), () => new Array(shape[0].length).fill(0));
//
// for(let i = 0; i < shape.length; i++) {
//     for (let j = 0; j < shape[i].length; j++) {
//         new_arr[j][shape.length - 1 - i] = shape[i][j];
//     }
// }
// console.log(shape);
// console.log(new_arr);

// 테트리스 한 블럭 크기
// 랜덤 테트리스 블록 가져오기
let current_random_Tetris_Block = getNewBlock();
// 색상 빼서 결정
// 첨엔 함수로 안하고 color 변수설정해서 했지만 함수로 호출하기로 했음.
function getColor () {
// --           ---           ----           |              --
// -- => 노란색     | => 보라색       => 빨간색  --- => 초록색      -- => 파란색
    if(current_random_Tetris_Block.basicShape === tetris_shape[0]){
        return "yellow"
    } else if(current_random_Tetris_Block.basicShape === tetris_shape[1]){
        return "purple"
    } else if(current_random_Tetris_Block.basicShape === tetris_shape[2]){
        return "red"
    } else if(current_random_Tetris_Block.basicShape === tetris_shape[3]) {
        return "green"
    } else if(current_random_Tetris_Block.basicShape === tetris_shape[4]) {
        return "blue"
    }
}

let blockSize = 25;

// 테트리스 블록이 쌓이게 해보기
// 일단 내려갔을 때 쌓인걸 저장 할 배열을 생성을 해야할 것 같다
const new_rows = Math.floor(600 / blockSize); // 24열
const new_cols = Math.floor(700 / blockSize) - 10; // 28행 -> 18행으로 줄이기.

// 여기에서 이제 1이면 블록이 쌓인 곳, 0이면 안쌓인 곳으로 지정.
// color 를 지정을 안하면 쌓인 후에, 다음에 나올 색깔로 변한다...
let new_tetris = Array.from({ length: new_rows },
    () => Array(new_cols).fill({filled: 0, color: null}));

// 블록을 쌓는 함수
function drawStackBlock() {
    for(let i = 0; i < new_rows; i++){
        for(let j = 0; j < new_cols; j++){
            if(new_tetris[i][j].filled === 1){
                ctx.fillStyle= new_tetris[i][j].color;
                ctx.fillRect(j * blockSize, i * blockSize, blockSize, blockSize);
                ctx.strokeRect(j * blockSize, i * blockSize, blockSize, blockSize);
            }
        }
    }
}

// 벽이나 바닥, 테트리스 블록에 충돌했는지 확인
function checkCollideEnd(x, y) {
    const shape = current_random_Tetris_Block.shape

    for (let i = 0; i < shape.length; i++) { // 이게 지금 0부터 4까지
        for (let j = 0; j < shape[i].length; j++) { // 여기도 0부터 4까지
            if (shape[i][j] === 1) {
                let newX = Math.floor(x) + j;
                let newY = Math.floor(y) + i;
                // 바닥만 충돌하는지 체크. 양쪽 벽도 체크했다가 게임이 끝나버리는 오류 발견.
                if (newY >= new_rows) {
                    return true;
                }
                if (newY >= 0 && newX >= 0 && newX < new_cols && new_tetris[newY][newX].filled === 1) {
                    return true;
                }
            }
        }
    }
    return false;
}

// 블록이 더 이동할 수 없어서 현재 자리를 저장하는?
function stayBlock(x, y) {
    const shape = current_random_Tetris_Block.shape
    const currentColor = getColor();

    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] === 1) {
                let newX = Math.floor(x) + j;
                let newY = Math.floor(y) + i;
                if (newY >= 0 && newY < new_rows && newX >= 0 && newX < new_cols) {
                    new_tetris[newY][newX] = {
                        filled: 1,
                        color: currentColor
                    };
                }
            }
        }
    }
    current_random_Tetris_Block = next_Tetris_Block;
    next_Tetris_Block = getNewBlock();
}

// 한 줄이 1로 가득찼는지 확인을 하는 함수 + 100점 오르게 해주는 함수.
function checkFullLines() {
    // 맨 밑에서부터 확인을 해야하므로 반대로 돌리기
    for (let i = new_rows - 1; i >= 0; i--) {
        // console.log(`라인 체크 ${i}:`, new_tetris[i]);
        // every 함수를 써서 배열 내의 모든 원소가 조건을 만족하는지
        // --> 테트리스의 라인의 값이 모두 1인지 확인해서 제거하기.
        // 계속 블록이 다 쌓여도 안사라져서 console.log 로 확인을 해보니
        // 블록이 다 쌓이면 0~17번까지만 1로 채워져서 new_cols 의 값을 변경하여야 했다.
        if (new_tetris[i].every(line => line.filled === 1)) {
            // 해당 줄을 제거하고 위의 줄들을 한칸씩 내림
            new_tetris.splice(i, 1);
            // 맨 윗줄 0으로 채워놓기.
            new_tetris.unshift(new Array(new_cols).fill({filled: 0, color: null}));
            score += 100;
            // 여러 줄이 동시에 완성되었을 경우를 위해
            // 한 줄이 없어질 때마다 i를 1 증가시켜 같은 위치를 다시 검사
            i++;
        }
    }
}

// 이동시킬 변수 설정
let tetris_dx = 200; // 현재 시작점 위치 잡기
let tetris_dy = 0; // 현재 시작점 위치 잡기

// 왼쪽 오른쪽 키보드 입력 시 쓸 변수들
let rightPress = false;
let leftPress = false;
let upPress = false;
let downPress = false;

document.addEventListener("keydown", keyMove, false);

function keyMove(e) {
    if(e.keyCode === 39 || e.key === "Right" || e.key === "ArrowRight"){
        const rightMargin = getRightBlock(current_random_Tetris_Block.shape);
        const maxX = canvas.width - (blockSize * (4 - rightMargin));

        // draw_Tetris_Block 에 해놨다가, 키 조작하는 곳에 모아두기 위해 옮김.
        if (tetris_dx < maxX && !checkCollideEnd((tetris_dx + blockSize) / blockSize, tetris_dy / blockSize)) {
            tetris_dx += blockSize;
            // 부드럽게 하기 위해서 새로 그리기 ! 안그리면 너무 뚝뚝 끊어짐.
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            draw_Tetris_Block();
        }
        rightPress = false;
    }else if(e.keyCode === 37 || e.key === "Left" ||e.key === "ArrowLeft"){
        const leftMargin = getLeftBlock(current_random_Tetris_Block.shape);
        const minX = -(leftMargin * blockSize);

        if (tetris_dx > minX && !checkCollideEnd((tetris_dx - blockSize) / blockSize, tetris_dy / blockSize)) {
            tetris_dx -= blockSize;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            draw_Tetris_Block();
        }
        leftPress = false;
    }else if(e.keyCode === 38 || e.key === "Up" || e.key === "ArrowUp"){
        rotateMoveClick();
        upPress = false;
    } else if(e.keyCode === 40 || e.key === "Down" ||e.key === "ArrowDown") {
        if (!checkCollideEnd(tetris_dx / blockSize, (tetris_dy + blockSize) / blockSize)) {
            tetris_dy += blockSize;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            draw_Tetris_Block();
        }
        downPress = false;
    }
}


// 왼쪽 위에 다음에 나올 블록 그려두기
let next_Tetris_Block = getNewBlock()

// 지금 첫 랜덤 테트리스 블록 색깔 설정만 해놔서
// 다음에 나올 테트리스 블록 색깔도 설정해야됨
function getNextColor() {
    if(next_Tetris_Block.basicShape === tetris_shape[0]){
        return "yellow"
    } else if(next_Tetris_Block.basicShape === tetris_shape[1]){
        return "purple"
    } else if(next_Tetris_Block.basicShape === tetris_shape[2]){
        return "red"
    } else if(next_Tetris_Block.basicShape === tetris_shape[3]) {
        return "green"
    } else if(next_Tetris_Block.basicShape === tetris_shape[4]) {
        return "blue"
    }
}


// 배열을 4*4 로 만들어놔서 0으로 된 부분도 크기가 되는건지
// 오른쪽이랑 왼쪽 끝에 안붙어서 설정을 해야된다..
function getLeftBlock(shape) {
    for (let j = 0; j < shape[0].length; j++) {
        for (let i = 0; i < shape.length; i++) {
            // 왼쪽에서부터 1이 있는지 확인.
            // return 1 =>  빈칸이 있다는 소리
            if (shape[i][j] === 1) {
                return j;
            }
        }
    }
    return 0;
}

function getRightBlock(shape) {
    for (let j = shape[0].length - 1; j >= 0; j--) {
        for (let i = 0; i < shape.length; i++) {
            if (shape[i][j] === 1) {
                // 오른쪽부터 1 확인
                // 0 을 리턴하면 빈칸이 없다는 소리
                return shape[0].length - j - 1;
            }
        }
    }
    return 0;
}

// 다음에 나올 블록을 그리는 함수인데..
// 블록들을 stroke 안에 넣으려고 사이즈 조절을 하는 중인데
// ---- 이 긴 막대기는 계속 딱 맞게 들어간다..
// -> 해결하기위해 I 모양을 옆으로 눕혔습니다.. ( | -> ㅡ 모양으로 )
function draw_Preview_Block() {
    let previewX = 10;
    let previewY = 10;
    let previewSize = blockSize;

    ctx.fillStyle = '#000';
    ctx.strokeRect(
        previewX,
        previewY,
        previewSize * 6,
        previewSize * 4,
    );

    const blockWidth = next_Tetris_Block.shape[0].length * previewSize;
    const blockHeight = next_Tetris_Block.shape.length * previewSize;
    const offsetX = previewX + (previewSize * 5 - blockWidth) / 2;
    const offsetY = previewY + (previewSize * 4 - blockHeight);

    for (let i = 0; i < next_Tetris_Block.shape.length; i++) {
        for (let j = 0; j < next_Tetris_Block.shape[i].length; j++) {
            if (next_Tetris_Block.shape[i][j] === 1) {
                ctx.fillStyle = getNextColor();
                ctx.fillRect(
                    // offsetX, offsetY 부분 tetris_dx, tetris_dy로 하면
                    // 현재의 테트리스 블록이랑 같이 겹쳐서 내려가게 됨!
                    offsetX + j * previewSize,
                    offsetY + i * previewSize,
                    previewSize,
                    previewSize);
                ctx.strokeRect(
                    offsetX + j * previewSize,
                    offsetY + i * previewSize,
                    previewSize,
                    previewSize);
            }
        }
    }
}

let score = 0;

function draw_Score() {
    ctx.font = "15px serif";
    ctx.fillStyle = '#000';
    ctx.fillText("Score: " + score, 340, 40)

    ctx.fillStyle = '#000';
    ctx.strokeRect(330, 15, 110, 40);
}
// 랜덤 테트리스 블럭을 for 문으로 돌려서 가져오기 !
// 그림을 그리는데, 배열의 값이 0 이면 빈칸, 배열의 값이 1이면 색깔 넣기
// 애니메이션 넣기 위해서 function 으로 바꾸기
function draw_Tetris_Block() {
    // 테트리스 블록을 만들 때마다 clear 해줘서 잔상 없애기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ctx.strokeStyle = '#eee';
    // for (let i = 0; i < new_rows; i++) {
    //     for (let j = 0; j < new_cols; j++) {
    //         ctx.strokeRect(j * blockSize, i * blockSize, blockSize, blockSize);
    //     }
    // }

    drawStackBlock();
    draw_Score();

    for (let i = 0; i < current_random_Tetris_Block.shape.length; i++) {
        for (let j = 0; j < current_random_Tetris_Block.shape[i].length; j++) {
            if (current_random_Tetris_Block.shape[i][j] === 1) {
                // 처음엔 fillRect 를 먼저 썼지만, 순서는 fillStyle -> fillRect 순으로
                ctx.fillStyle = getColor();
                ctx.fillRect(
                    Math.floor(tetris_dx + j * blockSize),
                    Math.floor(tetris_dy + i * blockSize),
                    blockSize,
                    blockSize);
                // fillRect 만 하면 테트리스 도형만 생겨서
                // 그 안에 선을 그리기 위해 strokeRect 사용
                ctx.strokeRect(
                    Math.floor(tetris_dx + j * blockSize),
                    Math.floor(tetris_dy + i * blockSize),
                    blockSize,
                    blockSize);
            }
        }
    }
    draw_Preview_Block();
    // 이젠 벽이나 블록에 충돌했을 때의 함수를 사용해서 그려야될 것 같다.
    if (checkCollideEnd(tetris_dx / blockSize, tetris_dy / blockSize + 1)) {
        stayBlock(tetris_dx / blockSize, tetris_dy / blockSize);
        checkFullLines();
        tetris_dy = 0;
        tetris_dx = 200;

        // 게임을 끝낼 조건 체크하기!
        if (checkCollideEnd(tetris_dx / blockSize, 0)) {
            alert('게임 오버! 점수: ' + score);

            // 게임이 끝난 후 초기화시키기
            new_tetris = Array.from({length: new_rows},
                () => Array(new_cols).fill({filled: 0, color: null}));
            score = 0;

            current_random_Tetris_Block = getNewBlock();
            next_Tetris_Block = getNewBlock();
        }
    } else {
            tetris_dy += 10;
        }
        if (score >= 1000) {
            alert('게임 클리어! 점수: ' + score);

            // 게임이 끝난 후 초기화시키기
            new_tetris = Array.from({length: new_rows},
                () => Array(new_cols).fill({filled: 0, color: null}));
            score = 0;

            current_random_Tetris_Block = getNewBlock();
            next_Tetris_Block = getNewBlock();
        }
    // requestAnimationFrame
    // - 브라우저한테 수행하기를 원하는 애니메이션을 알리고 다음 리페인트가 진행되기 전에 호출. ( 초당 60회 반복 )
    // - % 를 써서 setInterval 처럼 가능.
    // requestAnimationFrame(draw_Tetris_Block);
}
// 부드럽게 내려오는 것보다 진짜 테트리스처럼 만들기 위해 setInterval 로 수정했습니다
setInterval(draw_Tetris_Block, 700);


// 좌 버튼 누를 시 왼쪽으로 움직이는 함수
function leftMoveClick () {
    // 왼쪽 벽 안넘어가게 해주기
    const leftMargin = getLeftBlock(current_random_Tetris_Block.shape);
    const minX = -(leftMargin * blockSize);

    // 한 번에 더 많이 이동하도록 수정
    const leftFastMove = blockSize * 2; // 2칸씩 이동

    // 더 빠르게 이동시키다 보니까 벽에 안붙는 현상 제거하기 위해 설정.
    const nextX = tetris_dx - leftFastMove;
    const maximumX = Math.max(nextX, minX);

    if (tetris_dx > minX) {
        if (!checkCollideEnd(maximumX / blockSize, tetris_dy / blockSize)) {
            tetris_dx = maximumX;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw_Tetris_Block();
        }
    }
}

// 우 버튼 누를 시 오른쪽으로 움직이는 함수
function rightMoveClick () {
    // 오른쪽 벽 안넘어가게 해주기.
    const rightMargin = getRightBlock(current_random_Tetris_Block.shape);
    const maxX = canvas.width - (blockSize * (4 - rightMargin));

    // 한 번에 더 많이 이동하도록 수정
    const rightFastMove = blockSize * 2;

    const nextX = tetris_dx + rightFastMove;
    const minimumX = Math.min(nextX, maxX);

    if (tetris_dx < maxX) {
        if (!checkCollideEnd(minimumX / blockSize, tetris_dy / blockSize)) {
            tetris_dx = minimumX;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw_Tetris_Block();
        }
    }
}

// 회전 버튼 누를 시 회전시키는 함수 -> 위에서 배열 돌리는 연습한거 적용.
function rotateMoveClick () {
    let new_arr = Array.from(Array(4), () => new Array(4).fill(0));

    // for 문 안에 i 의 범위를 변수로 바꿔보려고 시도를 해봤지만 계속 에러발생.
    for(let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            new_arr[j][3 - i] = current_random_Tetris_Block.shape[i][j];
        }
    }
    current_random_Tetris_Block.shape = new_arr;

    // 현재 양쪽 벽에서 블록을 돌리면 나가는 현상 발생
    const leftMargin = getLeftBlock(current_random_Tetris_Block.shape);
    const minX = -(leftMargin * blockSize);

    if (tetris_dx < minX) {
        tetris_dx = minX;
    }

    const rightMargin = getRightBlock(current_random_Tetris_Block.shape);
    const maxX = canvas.width - (blockSize * (4 - rightMargin));

    if (tetris_dx > maxX) {
        tetris_dx = maxX;
    }

    // 회전 시 충돌 체크하기
    const turnShape = current_random_Tetris_Block.shape
    // 블록 옆에서 블록을 돌리면 게임이 꺼지는 오류가 발생해서 충돌 체크 코드 새로 작성
    // => 원래는 checkColliedEnd 함수 썼었음.
    let canRotate = true;
    for(let i = 0; i < current_random_Tetris_Block.shape.length; i++) {
        for(let j = 0; j < current_random_Tetris_Block.shape[i].length; j++) {
            if (current_random_Tetris_Block.shape[i][j] === 1) {
                let newX = Math.floor(tetris_dx / blockSize) + j;
                let newY = Math.floor(tetris_dy / blockSize) + i;

                // 캔버스 경계 및 다른 테트리스 블록들과의 충돌 체크하기
                if (newY >= new_rows || newX < 0 || newX >= new_cols ||
                    (newY >= 0 && new_tetris[newY][newX].filled === 1)) {
                    canRotate = false;
                    break;
                }
            }
        }
        if (!canRotate) break;
    }

    // 회전할 수 없다면 원래 모양으로 복원
    if (!canRotate) {
        current_random_Tetris_Block.shape = turnShape;
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_Tetris_Block();
    // !!
    // 처음엔 돌리고 다시 그려야되는줄 알고 넣어놨다가
    // 윗 방향키를 누르면 캔버스가 다시 그려지는걸 확인
    // 그래서 주석처리
    // !!
    // // 회전된 도형을 캔버스에 다시 그려줘야됨.
    // for (let i = 0; i < 4; i++) {
    //     for (let j = 0; j < 4; j++) {
    //         if (current_random_Tetris_Block[i][j] === 1) {
    //             ctx.fillStyle = getColor();
    //             ctx.fillRect(
    //                 tetris_dx + j * blockSize,
    //                 tetris_dy + i * blockSize,
    //                 blockSize,
    //                 blockSize
    //             );
    //             ctx.strokeRect(
    //                 tetris_dx + j * blockSize,
    //                 tetris_dy + i * blockSize,
    //                 blockSize,
    //                 blockSize
    //             );
    //         }
    //     }
    // }
    //
}

// 하강버튼 누를 시 하강시키는 함수
function downMoveClick () {
    // 충돌 체크를 먼저 수행해서 충돌이 없을 경우에만 하강
    if (!checkCollideEnd(tetris_dx / blockSize, (tetris_dy + blockSize) / blockSize)) {
        tetris_dy += blockSize;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw_Tetris_Block();
    }
}

