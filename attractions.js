document.addEventListener('DOMContentLoaded', function() {
    const spots = document.querySelectorAll('.spot');

    // 移动设备检测
    function isMobileDevice() {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    // 为每个景点添加hover效果
    spots.forEach(spot => {
        const spotName = spot.getAttribute('data-spot');
        const details = document.getElementById(`${spotName}-details`);

        // 移动设备适配
        if (isMobileDevice()) {
            details.style.position = 'absolute';
            details.style.left = '50%';
            details.style.transform = 'translate(-50%, 20px)';
            details.style.top = '100%';
            details.style.bottom = 'auto';
        }

        // 鼠标进入时显示详情
        spot.addEventListener('mouseenter', () => {
            details.style.opacity = '1';
            details.style.pointerEvents = 'auto';
        });

        // 鼠标离开时隐藏详情
        spot.addEventListener('mouseleave', () => {
            details.style.opacity = '0';
            details.style.pointerEvents = 'none';
        });

        // 详情框自身的鼠标事件
        details.addEventListener('mouseenter', () => {
            details.style.opacity = '1';
            details.style.pointerEvents = 'auto';
        });

        details.addEventListener('mouseleave', () => {
            details.style.opacity = '0';
            details.style.pointerEvents = 'none';
        });
    });
});

