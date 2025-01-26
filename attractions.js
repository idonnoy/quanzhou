document.addEventListener('DOMContentLoaded', function() {
    const spots = document.querySelectorAll('.spot');
    let activeDetail = null;

    function positionDetails(spot, details) {
        // 获取SVG元素的位置和大小
        const svg = document.querySelector('.route-path');
        const svgRect = svg.getBoundingClientRect();
        
        // 获取圆圈的位置
        const circle = spot.querySelector('circle');
        const cx = parseFloat(circle.getAttribute('cx'));
        const cy = parseFloat(circle.getAttribute('cy'));
        
        // 计算圆圈在页面中的实际位置
        const spotX = svgRect.left + (cx * svgRect.width / 1000);
        const spotY = svgRect.top + (cy * svgRect.height / 400);

        // 计算详情框的位置
        let left = spotX - (details.offsetWidth / 2);
        let top = spotY - details.offsetHeight - 20; // 默认显示在圆圈上方

        // 检查是否超出视口左右边界
        const viewportWidth = window.innerWidth;
        if (left < 10) {
            left = 10; // 距离左边界10px
        } else if (left + details.offsetWidth > viewportWidth - 10) {
            left = viewportWidth - details.offsetWidth - 10; // 距离右边界10px
        }

        // 如果上方空间不足，则显示在下方
        if (top < 10) {
            top = spotY + 40; // 显示在圆圈下方
            details.classList.add('bottom');
        } else {
            details.classList.remove('bottom');
        }

        // 设置位置
        details.style.left = `${left}px`;
        details.style.top = `${top + window.scrollY}px`; // 添加页面滚动偏移
    }

    spots.forEach(spot => {
        const spotName = spot.getAttribute('data-spot');
        const details = document.getElementById(`${spotName}-details`);

        // 鼠标进入圆圈
        spot.addEventListener('mouseenter', () => {
            // 隐藏之前显示的详情
            if (activeDetail && activeDetail !== details) {
                activeDetail.classList.remove('active');
            }

            // 先设置为可见但透明，以便获取正确的尺寸
            details.style.opacity = '0';
            details.classList.add('active');

            // 计算并设置位置
            positionDetails(spot, details);

            // 显示详情框
            requestAnimationFrame(() => {
                details.style.opacity = '1';
            });
            
            activeDetail = details;
        });

        // 鼠标离开圆圈
        spot.addEventListener('mouseleave', (e) => {
            // 检查鼠标是否移动到详情框上
            const toElement = e.relatedTarget;
            if (!details.contains(toElement)) {
                details.classList.remove('active');
                activeDetail = null;
            }
        });

        // 鼠标离开详情框
        details.addEventListener('mouseleave', () => {
            details.classList.remove('active');
            activeDetail = null;
        });
    });

    // 监听窗口大小变化，重新定位活动的详情框
    window.addEventListener('resize', () => {
        if (activeDetail) {
            const activeSpot = document.querySelector(`[data-spot="${activeDetail.id.replace('-details', '')}"]`);
            positionDetails(activeSpot, activeDetail);
        }
    });

    // 监听页面滚动，重新定位活动的详情框
    window.addEventListener('scroll', () => {
        if (activeDetail) {
            const activeSpot = document.querySelector(`[data-spot="${activeDetail.id.replace('-details', '')}"]`);
            positionDetails(activeSpot, activeDetail);
        }
    });
});
