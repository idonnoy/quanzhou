document.addEventListener('DOMContentLoaded', function() {
    const spots = document.querySelectorAll('.spot');
    let activeDetail = null;
    let touchStartTime;
    let isTouchMove = false;

    function positionDetails(spot, details) {
        // 获取SVG元素的位置和大小
        const svg = document.querySelector('.route-path');
        const svgRect = svg.getBoundingClientRect();
        
        // 获取圆圈的位置
        const circle = spot.querySelector('circle');
        const cx = parseFloat(circle.getAttribute('cx'));
        const cy = parseFloat(circle.getAttribute('cy'));
        
        // 计算圆圈在页面中的实际位置
        const spotX = svgRect.left + (cx * svgRect.width / 1200);
        const spotY = svgRect.top + (cy * svgRect.height / 400);

        // 检查是否是移动设备
        if (window.matchMedia('(max-width: 768px)').matches) {
            // 移动设备上固定在底部
            details.style.left = '50%';
            details.style.transform = 'translateX(-50%)';
            details.style.bottom = '20px';
            details.style.top = 'auto';
        } else {
        // 计算详情框的位置
        let left = spotX - (details.offsetWidth / 2);
            let top = spotY - details.offsetHeight - 20;

            // 检查是否超出视口边界
        const viewportWidth = window.innerWidth;
        if (left < 10) {
                left = 10;
        } else if (left + details.offsetWidth > viewportWidth - 10) {
                left = viewportWidth - details.offsetWidth - 10;
        }

        // 如果上方空间不足，则显示在下方
        if (top < 10) {
                top = spotY + 40;
            details.classList.add('bottom');
        } else {
            details.classList.remove('bottom');
        }

        details.style.left = `${left}px`;
            details.style.top = `${top + window.scrollY}px`;
        }
    }

    // 关闭所有详情框
    function closeAllDetails() {
        if (activeDetail) {
            activeDetail.classList.remove('active');
            activeDetail = null;
        }
    }

    // 处理点击/触摸事件
    function handleSpotInteraction(spot, event) {
        const spotName = spot.getAttribute('data-spot');
        const details = document.getElementById(`${spotName}-details`);

        if (activeDetail === details) {
            closeAllDetails();
        } else {
            closeAllDetails();
            details.style.opacity = '0';
            details.classList.add('active');
            positionDetails(spot, details);
            requestAnimationFrame(() => {
                details.style.opacity = '1';
            });
            activeDetail = details;
        }

        event.preventDefault();
        event.stopPropagation();
    }

    spots.forEach(spot => {
        // 触摸事件处理
        spot.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            isTouchMove = false;
        }, { passive: true });

        spot.addEventListener('touchmove', () => {
            isTouchMove = true;
        }, { passive: true });

        spot.addEventListener('touchend', (e) => {
            if (!isTouchMove && (Date.now() - touchStartTime) < 300) {
                handleSpotInteraction(spot, e);
            }
        });

        // 鼠标事件处理
        spot.addEventListener('click', (e) => {
            handleSpotInteraction(spot, e);
        });
    });

    // 点击其他区域关闭详情框
    document.addEventListener('click', (e) => {
        if (activeDetail && !e.target.closest('.spot') && !e.target.closest('.spot-details')) {
            closeAllDetails();
        }
    });

    // 监听窗口大小变化
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
        if (activeDetail) {
            const activeSpot = document.querySelector(`[data-spot="${activeDetail.id.replace('-details', '')}"]`);
            positionDetails(activeSpot, activeDetail);
        }
        }, 100);
    });

    // 监听页面滚动
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
        if (activeDetail) {
            const activeSpot = document.querySelector(`[data-spot="${activeDetail.id.replace('-details', '')}"]`);
            positionDetails(activeSpot, activeDetail);
        }
        }, 100);
    });
});

