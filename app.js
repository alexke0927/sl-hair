/**
 * ==========================================================================
 * SL百元專業剪髮 - 前端互動邏輯 (app.js)
 * 包含：動態排隊估算器、按鈕點擊波紋、導覽列滾動模糊、手機版選單切換與錯誤防呆處理。
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 確保全部模組順利初始化，並進行全域防呆錯誤捕捉
    try {
        initHeaderScroll();
        initMobileMenu();
        initButtonRipples();
        initQueueCalculator();
    } catch (globalError) {
        console.error('[CRITICAL] 網頁初始化失敗，請聯絡前端工程團隊：', globalError);
    }
});

/**
 * 1. 導覽列滾動狀態控制
 * 當使用者向下滑動網頁時，自動為 Header 加入深色背景類別
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) {
        console.warn('[Warning] 找不到 .header 元素，無法啟用滾動監聽。');
        return;
    }

    const scrollThreshold = 50; // 滾動超過 50px 時觸發樣式變更

    window.addEventListener('scroll', () => {
        try {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('header-scrolled');
            } else {
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
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!navToggle || !navMenu) {
        console.warn('[Warning] 手機選單按鈕或選單 DOM 缺失。');
        return;
    }

    // 切換選單狀態
    const toggleMenu = (e) => {
        e.stopPropagation();
        const isOpen = navMenu.style.display === 'flex';
        if (isOpen) {
            navMenu.style.display = 'none';
        } else {
            navMenu.style.display = 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '100%';
            navMenu.style.left = '0';
            navMenu.style.width = '100%';
            navMenu.style.backgroundColor = 'rgba(11, 19, 43, 0.95)';
            navMenu.style.padding = '1.5rem';
            navMenu.style.borderBottom = '1px solid var(--glass-border)';
        }
    };

    navToggle.addEventListener('click', toggleMenu);

    // 點擊選單內部項目時自動關閉選單 (方便平滑錨點跳轉)
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navMenu.style.display = 'none';
            }
        });
    });

    // 點擊網頁外部任意地方時自動關閉選單 (防止選單懸空)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && navMenu.style.display === 'flex') {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.style.display = 'none';
            }
        }
    });
}

/**
 * 3. 按鈕點擊動態波紋特效 (Ripple Effect)
 */
function initButtonRipples() {
    const buttons = document.querySelectorAll('.btn');
    if (buttons.length === 0) return;

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            try {
                // 建立波紋元素
                const circle = document.createElement('span');
                const diameter = Math.max(this.clientWidth, this.clientHeight);
                const radius = diameter / 2;

                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${e.clientX - this.getBoundingClientRect().left - radius}px`;
                circle.style.top = `${e.clientY - this.getBoundingClientRect().top - radius}px`;
                circle.classList.add('ripple');

                // 移除先前舊的波紋
                const ripple = this.querySelector('.ripple');
                if (ripple) {
                    ripple.remove();
                }

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
    const calcForm = document.getElementById('queueForm');
    const ticketInput = document.getElementById('ticketNumber');
    const resultDiv = document.getElementById('queueResult');
    const timeValueText = document.getElementById('timeValue');
    const inputError = document.getElementById('inputError');

    // 本機模擬當前叫號狀態
    const currentCallingNumber = 12; // 當前叫號
    const designersCount = 2;        // 設計師數量
    const averageMinutesPerCut = 10; // 每人平均剪髮時間

    if (!calcForm || !ticketInput || !resultDiv || !timeValueText || !inputError) {
        console.error('[Error] 初始化排隊估算器失敗：DOM 節點缺失。');
        return;
    }

    calcForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 重設視覺與錯誤狀態
        inputError.style.display = 'none';
        resultDiv.classList.remove('show');

        const inputValue = ticketInput.value.trim();

        // 防呆校驗規則：
        // 1. 是否為空值
        if (inputValue === '') {
            showInputError('請輸入您的號碼牌號碼。');
            return;
        }

        // 2. 是否為正整數
        const ticketNum = parseInt(inputValue, 10);
        if (isNaN(ticketNum) || !/^\d+$/.test(inputValue) || ticketNum <= 0) {
            showInputError('請輸入有效的正整數號碼牌（例如: 18）。');
            return;
        }

        // 3. 檢查是否小於當前叫號 (過號防呆)
        if (ticketNum < currentCallingNumber) {
            showInputError(`此號碼已過號（當前已叫至 ${currentCallingNumber} 號），請至櫃檯重新抽牌。`);
            return;
        }

        // 4. 正確輸入後，開始計算等候時間
        try {
            const difference = ticketNum - currentCallingNumber;
            
            if (difference === 0) {
                timeValueText.innerHTML = '0 <span>分鐘 (輪到您了)</span>';
                timeValueText.style.color = 'var(--color-accent)';
            } else {
                // 等候時間計算公式：前面人數 / 設計師數量 * 平均時間
                const estimatedWaitTime = Math.ceil((difference / designersCount) * averageMinutesPerCut);
                timeValueText.innerHTML = `${estimatedWaitTime} <span>分鐘</span>`;
                
                // 根據等待時間調整時間顏色
                if (estimatedWaitTime > 40) {
                    timeValueText.style.color = 'var(--color-orange)'; // 等待時間過長變橘色警告
                } else {
                    timeValueText.style.color = 'var(--color-accent)';
                }
            }

            // 顯示結果區域 (添加微動畫類別)
            resultDiv.classList.add('show');
        } catch (calcError) {
            console.error('[Error] 計算等待時間時發生異常：', calcError);
            showInputError('計算過程發生錯誤，請稍後再試。');
        }
    });

    // 輔助函式：顯示錯誤提示
    function showInputError(msg) {
        inputError.textContent = `⚠ ${msg}`;
        inputError.style.display = 'flex';
        ticketInput.focus();
    }
}
