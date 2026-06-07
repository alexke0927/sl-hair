/**
 * ==========================================================================
 * SL百元專業剪髮 - 前端互動邏輯 (app.js)
 * 包含：動態排隊估算器、按鈕點擊波紋、導覽列滾動模糊、手機版選單切換與錯誤防呆處理。
 * ==========================================================================
 */

// document.addEventListener('DOMContentLoaded', ...) 意思是「當整個 HTML 網頁都被瀏覽器完整讀取完畢後」，才執行大括號 {} 裡面的程式碼。
// 這樣可以避免網頁還沒載入完，程式碼就急著去抓按鈕而導致錯誤。
document.addEventListener('DOMContentLoaded', () => {
    // try...catch 是一個「錯誤防護罩」。如果 try 裡面的程式碼發生錯誤，就不會讓整個網頁當掉，而是會跑到 catch 裡面去處理錯誤。
    try {
        // 啟動「網頁往下捲動時，導覽列變色」的功能
        initHeaderScroll();
        // 啟動「手機版漢堡選單的開關」功能
        initMobileMenu();
        // 啟動「按鈕點擊時的水波紋特效」功能
        initButtonRipples();
        // 啟動「排隊時間估算器」功能
        initQueueCalculator();
    } catch (globalError) {
        // console.error 會在瀏覽器的「開發者工具」控制台中印出紅色的錯誤訊息，方便工程師抓蟲 (Debug)。
        console.error('[CRITICAL] 網頁初始化失敗，請聯絡前端工程團隊：', globalError);
    }
});

/**
 * 1. 導覽列滾動狀態控制
 * 當使用者向下滑動網頁時，自動為 Header 加入深色背景類別
 */
function initHeaderScroll() {
    // document.querySelector() 用來在網頁中尋找第一個 class 是 'header' 的 HTML 元素。
    const header = document.querySelector('.header');
    
    // 如果找不到這個元素 (例如這個網頁根本沒有導覽列)，就顯示警告並立刻結束這個函數 (return)。
    if (!header) {
        console.warn('[Warning] 找不到 .header 元素，無法啟用滾動監聽。');
        return;
    }

    // 設定一個門檻值：當網頁往下捲動超過 50 像素 (px) 時，我們才要改變導覽列的樣式。
    const scrollThreshold = 50; 

    // window.addEventListener('scroll', ...) 意思是監聽整個網頁的「捲動事件」。每次使用者滑鼠滾輪一動，就會執行這段程式碼。
    window.addEventListener('scroll', () => {
        try {
            // window.scrollY 會告訴我們目前網頁從最頂端往下捲動了多少距離。
            if (window.scrollY > scrollThreshold) {
                // 如果捲動超過 50px，我們就給導覽列加上 'header-scrolled' 這個 class，這會讓導覽列變深色 (搭配 CSS)。
                header.classList.add('header-scrolled');
            } else {
                // 如果捲動小於 50px (回到最上面了)，就把這個 class 拿掉，導覽列恢復透明。
                header.classList.remove('header-scrolled');
            }
        } catch (error) {
            console.error('[Error] 處理滾動事件時發生錯誤：', error);
        }
    });
}

/**
 * 2. 手機版收合選單邏輯
 * 點擊漢堡選單按鈕可展開/收合選單，點擊外面可關閉選單
 */
function initMobileMenu() {
    // 抓取「漢堡按鈕」的元素
    const navToggle = document.querySelector('.nav-toggle');
    // 抓取「隱藏的手機版選單」元素
    const navMenu = document.querySelector('.nav-menu');
    
    // 如果這兩個元素有任何一個不存在，就結束函數。
    if (!navToggle || !navMenu) {
        console.warn('[Warning] 手機選單按鈕或選單 DOM 缺失。');
        return;
    }

    // 這是一個「切換選單開關」的自訂小函數
    const toggleMenu = (e) => {
        // e.stopPropagation() 會阻止點擊事件繼續往上傳遞，避免一按按鈕就觸發到「點擊網頁外部關閉選單」的功能。
        e.stopPropagation();
        
        // 檢查選單目前的 display 樣式是否為 'flex' (代表正在顯示中)
        const isOpen = navMenu.style.display === 'flex';
        
        if (isOpen) {
            // 如果是打開的，就把它隱藏 (變成 'none')
            navMenu.style.display = 'none';
        } else {
            // 如果是隱藏的，就把它打開 (變成 'flex')
            navMenu.style.display = 'flex';
            // 以下是直接用 JavaScript 強制設定選單打開時的外觀排版
            navMenu.style.flexDirection = 'column'; // 讓選單裡的連結變成直排
            navMenu.style.position = 'absolute';    // 讓選單浮動在畫面上方
            navMenu.style.top = '100%';             // 讓選單出現在導覽列的正下方
            navMenu.style.left = '0';               // 靠左對齊
            navMenu.style.width = '100%';           // 寬度撐滿整個螢幕
            navMenu.style.backgroundColor = 'rgba(11, 19, 43, 0.95)'; // 設定選單的深藍色半透明背景
            navMenu.style.padding = '1.5rem';       // 內縮邊距
            navMenu.style.borderBottom = '1px solid var(--glass-border)'; // 下方加一條裝飾線
        }
    };

    // 當有人點擊「漢堡按鈕」時，執行 toggleMenu 這個開關函數
    navToggle.addEventListener('click', toggleMenu);

    // querySelectorAll 會抓出選單裡面所有的連結 (例如: 服務項目、分店資訊...)
    // forEach 代表我們要把每一顆連結都綁上一個點擊事件
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            // 當客人點擊任何一個連結時，如果他用的是手機 (螢幕寬度小於等於 768px)，就自動幫他把選單關掉
            if (window.innerWidth <= 768) {
                navMenu.style.display = 'none';
            }
        });
    });

    // 監聽整個網頁的點擊事件
    document.addEventListener('click', (e) => {
        // 如果現在是在手機模式，而且選單是打開的狀態
        if (window.innerWidth <= 768 && navMenu.style.display === 'flex') {
            // 如果客人點擊的地方，既「不是選單內部」，也「不是漢堡按鈕本身」 (代表他點了旁邊的空白處)
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                // 就自動幫他把選單關掉
                navMenu.style.display = 'none';
            }
        }
    });
}

/**
 * 3. 按鈕點擊動態波紋特效 (Ripple Effect)
 */
function initButtonRipples() {
    // 找出網頁上所有加上 class="btn" 的按鈕
    const buttons = document.querySelectorAll('.btn');
    // 如果找不到任何按鈕，直接結束
    if (buttons.length === 0) return;

    // 針對每一個按鈕，綁定一個點擊事件
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            try {
                // document.createElement('span') 會在網頁中動態「無中生有」創造出一個 <span> 標籤，用來當作水波紋圈圈。
                const circle = document.createElement('span');
                
                // Math.max 取按鈕的寬度或高度中，比較長的那一個當作波紋的直徑，確保波紋可以覆蓋整個按鈕。
                const diameter = Math.max(this.clientWidth, this.clientHeight);
                const radius = diameter / 2; // 直徑除以 2 算出半徑

                // 設定波紋的寬度和高度
                circle.style.width = circle.style.height = `${diameter}px`;
                
                // e.clientX 是滑鼠點擊螢幕的 X 座標。
                // this.getBoundingClientRect().left 是按鈕左邊緣距離螢幕左邊的距離。
                // 兩者相減再扣掉半徑，就能精準算出波紋「中心點」應該出現在滑鼠點擊的位置。
                circle.style.left = `${e.clientX - this.getBoundingClientRect().left - radius}px`;
                circle.style.top = `${e.clientY - this.getBoundingClientRect().top - radius}px`;
                
                // 幫這個新建的 <span> 加上 'ripple' 這個 CSS class (CSS 裡面有寫好的擴散動畫)
                circle.classList.add('ripple');

                // 為了避免按太多次產生太多波紋元素導致網頁卡頓，我們在加新的波紋前，先檢查有沒有舊的波紋
                const ripple = this.querySelector('.ripple');
                if (ripple) {
                    ripple.remove(); // 如果有舊的波紋，就把它刪掉
                }

                // 最後，把設定好的波紋元素塞進這顆按鈕裡面
                this.appendChild(circle);
            } catch (err) {
                console.error('[Error] 無法繪製按鈕點擊波紋特效：', err);
            }
        });
    });
}

/**
 * 4. 排隊等候時間估算器 (核心互動)
 * 輸入您的號碼牌，系統動態估計需等候時間。
 * 每人平均剪髮時間約為 10 分鐘，現場有 2 名設計師同時作業。
 */
function initQueueCalculator() {
    // 抓取畫面上所有的關鍵元素：輸入表單、輸入框、結果顯示區、時間文字、錯誤訊息區
    const calcForm = document.getElementById('queueForm');
    const ticketInput = document.getElementById('ticketNumber');
    const resultDiv = document.getElementById('queueResult');
    const timeValueText = document.getElementById('timeValue');
    const inputError = document.getElementById('inputError');

    // 這些是本機模擬的設定值 (如果沒有連接資料庫的話)
    const currentCallingNumber = 12; // 假設現在叫到 12 號
    const designersCount = 2;        // 假設有 2 位設計師在剪髮
    const averageMinutesPerCut = 10; // 假設每個人平均剪 10 分鐘

    // 如果畫面上有少任何一個元件，代表這個網頁可能沒有這個功能，我們就報錯並退出。
    if (!calcForm || !ticketInput || !resultDiv || !timeValueText || !inputError) {
        console.error('[Error] 初始化排隊估算器失敗：DOM 節點缺失。');
        return;
    }

    // 當客人點擊表單的「送出(計算)」按鈕時觸發
    calcForm.addEventListener('submit', (e) => {
        // e.preventDefault() 非常重要！它可以防止表單送出時「重整整個網頁」的預設行為。
        e.preventDefault();
        
        // 每次計算前，先隱藏錯誤訊息，並隱藏上一次的計算結果
        inputError.style.display = 'none';
        resultDiv.classList.remove('show');

        // 取得客人輸入在輸入框裡面的文字，並用 trim() 去掉前後多餘的空白
        const inputValue = ticketInput.value.trim();

        // 【防呆第一關】：檢查客人是不是什麼都沒輸入就按送出
        if (inputValue === '') {
            showInputError('請輸入您的號碼牌號碼。');
            return; // 結束執行
        }

        // 【防呆第二關】：檢查輸入的是不是「正整數」
        // parseInt 會把文字轉換成數字 (10代表十進位)
        const ticketNum = parseInt(inputValue, 10);
        // isNaN 用來檢查它是不是數字 (Not a Number)
        // /^\d+$/.test 用正規表達式檢查是不是全數字，不能有小數點或英文字母
        if (isNaN(ticketNum) || !/^\d+$/.test(inputValue) || ticketNum <= 0) {
            showInputError('請輸入有效的正整數號碼牌（例如: 18）。');
            return; // 結束執行
        }

        // 【防呆第三關】：檢查輸入的號碼是不是比目前叫號還小 (代表已經過號了)
        if (ticketNum < currentCallingNumber) {
            showInputError(`此號碼已過號（當前已叫至 ${currentCallingNumber} 號），請至櫃檯重新抽牌。`);
            return; // 結束執行
        }

        // 當以上防呆都通過後，我們就可以開始安心計算等候時間了
        try {
            // 計算：客人的號碼 減去 現在的號碼 = 還有幾個人排在前面
            const difference = ticketNum - currentCallingNumber;
            
            if (difference === 0) {
                // 如果相減是 0，代表現在就剛好叫到他的號碼了！
                timeValueText.innerHTML = '0 <span>分鐘 (輪到您了)</span>';
                timeValueText.style.color = 'var(--color-accent)'; // 變成顯眼的螢光綠/藍色
            } else {
                // 等候時間計算公式：(前面人數 / 設計師數量) * 每人平均時間
                // Math.ceil 是「無條件進位」，例如算出 15.5 分鐘，就顯示 16 分鐘，避免讓客人等更久。
                const estimatedWaitTime = Math.ceil((difference / designersCount) * averageMinutesPerCut);
                
                // 將算出來的時間寫回畫面上
                timeValueText.innerHTML = `${estimatedWaitTime} <span>分鐘</span>`;
                
                // 如果預估要等超過 40 分鐘，我們就把時間變成橘紅色來警告客人要等很久
                if (estimatedWaitTime > 40) {
                    timeValueText.style.color = 'var(--color-orange)'; 
                } else {
                    timeValueText.style.color = 'var(--color-accent)';
                }
            }

            // 把計算結果的區塊加上 'show' 這個 class，結果就會帶有動畫地顯示出來囉！
            resultDiv.classList.add('show');
        } catch (calcError) {
            console.error('[Error] 計算等待時間時發生異常：', calcError);
            showInputError('計算過程發生錯誤，請稍後再試。');
        }
    });

    // 這是一個「小助手函式」，專門用來把錯誤訊息顯示在畫面上，並讓游標重新回到輸入框讓客人重打
    function showInputError(msg) {
        inputError.textContent = `⚠ ${msg}`;   // 把錯誤文字塞進去
        inputError.style.display = 'flex';     // 顯示錯誤訊息區塊
        ticketInput.focus();                   // 自動幫客人把游標對焦回輸入框
    }
}
