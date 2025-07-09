// 오디오 요소
const sounds = {
    success: new Audio('assets/Ascending 3.mp3'),
    fail: new Audio('assets/fail_01.mp3'),
    finalSuccess: new Audio('assets/suc_01.mp3')
};

// 오디오 재생 함수
async function playSound(sound) {
    try {
        // 오디오 초기화
        sound.currentTime = 0;
        // 볼륨 설정
        sound.volume = 0.5;
        // 재생
        await sound.play();
    } catch (error) {
        console.log('오디오 재생 실패:', error);
    }
}

// 화면 요소
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const couponScreen = document.getElementById('coupon-screen');

// 게임 요소
const timerProgress = document.getElementById('timer-progress');
const num1Element = document.getElementById('num1');
const num2Element = document.getElementById('num2');
const answerInput = document.getElementById('answer-input');
const scoreElement = document.getElementById('score');
const resultMessage = document.getElementById('result-message');

// 버튼 요소
const startButton = document.getElementById('start-button');
const submitButton = document.getElementById('submit-button');
const retryButton = document.getElementById('retry-button');
const homeButton = document.getElementById('home-button');
const saveCouponButton = document.getElementById('save-coupon');
const couponHomeButton = document.getElementById('coupon-home');

// 게임 상태
let currentScore = 0;
let timerInterval;
let timeLeft;

// 게임 초기화
function initGame() {
    currentScore = 0;
    scoreElement.textContent = currentScore;
    showScreen(startScreen);
    
    // 사용자 상호작용 시 오디오 초기화
    document.addEventListener('click', initAudio, { once: true });
}

// 오디오 초기화
function initAudio() {
    // 모든 오디오 프리로드
    Object.values(sounds).forEach(sound => {
        sound.load();
        // 음소거 상태로 재생했다가 바로 정지하여 오디오 컨텍스트 활성화
        sound.muted = true;
        sound.play().then(() => {
            sound.pause();
            sound.currentTime = 0;
            sound.muted = false;
        }).catch(console.log);
    });
}

// 문제 생성
function generateProblem() {
    const num1 = Math.floor(Math.random() * 41) + 10; // 10~50
    const num2 = Math.floor(Math.random() * 41) + 10; // 10~50
    num1Element.textContent = num1;
    num2Element.textContent = num2;
    answerInput.value = '';
    answerInput.focus();
    return num1 + num2;
}

// 타이머 시작
function startTimer() {
    timeLeft = 5000; // 5초
    timerProgress.style.width = '100%';
    timerProgress.style.transition = 'width 5s linear';
    setTimeout(() => {
        timerProgress.style.width = '0%';
    }, 50);

    return new Promise((resolve) => {
        timerInterval = setTimeout(() => {
            resolve(false);
        }, 5000);
    });
}

// 화면 전환
function showScreen(screen) {
    [startScreen, gameScreen, resultScreen, couponScreen].forEach(s => {
        s.classList.remove('active');
    });
    screen.classList.add('active');
}

// 게임 라운드 시작
async function startRound() {
    showScreen(gameScreen);
    const correctAnswer = generateProblem();
    const timerResult = startTimer();

    const result = await Promise.race([
        timerResult,
        new Promise(resolve => {
            submitButton.onclick = () => {
                clearTimeout(timerInterval);
                const userAnswer = parseInt(answerInput.value);
                resolve(userAnswer === correctAnswer);
            };
        })
    ]);

    handleRoundResult(result);
}

// 라운드 결과 처리
function handleRoundResult(isCorrect) {
    if (isCorrect) {
        currentScore++;
        scoreElement.textContent = currentScore;
        playSound(sounds.success);

        if (currentScore === 3) {
            showCouponScreen();
        } else {
            setTimeout(() => {
                startRound();
            }, 1000);
        }
    } else {
        playSound(sounds.fail);
        showFailScreen();
    }
}

// 실패 화면 표시
function showFailScreen() {
    resultMessage.textContent = '시간 초과 또는 오답입니다!';
    showScreen(resultScreen);
    const failImage = document.createElement('img');
    failImage.src = 'assets/ggg.png';
    failImage.classList.add('fail-animation');
    resultScreen.appendChild(failImage);
    setTimeout(() => {
        resultScreen.removeChild(failImage);
    }, 4000);
}

// 쿠폰 화면 표시
function showCouponScreen() {
    showScreen(couponScreen);
    playSound(sounds.finalSuccess);
    generateCoupon();
}

// 쿠폰 생성
function generateCoupon() {
    const canvas = document.getElementById('coupon-canvas');
    const ctx = canvas.getContext('2d');
    
    // 캔버스 크기 설정
    canvas.width = 300;
    canvas.height = 200;
    
    // 배경
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 테두리
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // 텍스트
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px "Noto Sans KR"';
    ctx.textAlign = 'center';
    ctx.fillText('🥤 음료수 1잔 무료 쿠폰', canvas.width/2, 80);
    
    // 날짜
    const date = new Date();
    ctx.font = '16px "Noto Sans KR"';
    ctx.fillText(`발급일: ${date.toLocaleDateString()}`, canvas.width/2, 120);
}

// 쿠폰 저장
function saveCoupon() {
    const canvas = document.getElementById('coupon-canvas');
    const link = document.createElement('a');
    link.download = '음료수쿠폰.png';
    link.href = canvas.toDataURL();
    link.click();
}

// 이벤트 리스너
startButton.addEventListener('click', startRound);
retryButton.addEventListener('click', startRound);
homeButton.addEventListener('click', initGame);
couponHomeButton.addEventListener('click', initGame);
saveCouponButton.addEventListener('click', saveCoupon);

// 게임 시작
initGame(); 