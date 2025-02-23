document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.carousel-container');
    const items = document.querySelectorAll('.culture-item');
    const detailCards = document.querySelectorAll('.detail-card');
    
    let currentAngle = 0;
    let currentIndex = 0;
    const totalItems = items.length;
    const angleStep = 360 / totalItems;
    let startX = 0;
    let lastX = 0;
    let isDragging = false;
    let animationFrameId = null;
    let velocity = 0;
    const friction = 0.95;
    let autoRotateAnimationId = null;
    let lastInteractionTime = 0;
    let isAutoRotating = false;
    let accumulatedDelta = 0;
    let lastAutoRotateAngle = 0;

    // 规范化角度到 -180 到 180 范围
    function normalizeAngle(angle) {
        angle = angle % 360;
        return angle > 180 ? angle - 360 : (angle < -180 ? angle + 360 : angle);
    }

    // 计算两个角度之间的最短距离
    function calculateShortestRotation(current, target) {
        const diff = normalizeAngle(target - current);
        return diff;
    }

    // 初始化位置
    function initializePositions() {
        items.forEach((item, index) => {
            const angle = angleStep * index;
            item.style.transform = `rotateY(${angle}deg)`;
            updateItemStyle(item, angle);
        });
        lastAutoRotateAngle = currentAngle;
    }

    // 更新项目样式
    function updateItemStyle(item, angle) {
        // 将角度转换到0-360范围用于样式计算
        const displayAngle = ((angle % 360) + 360) % 360;
        const zIndex = Math.round(Math.cos(displayAngle * Math.PI / 180) * 100);
        const opacity = (Math.cos(displayAngle * Math.PI / 180) + 1) / 2;
        
        item.style.zIndex = zIndex;
        item.style.opacity = 0.4 + (opacity * 0.6);
        
        if (Math.abs(displayAngle) < angleStep / 2 || Math.abs(displayAngle - 360) < angleStep / 2) {
            item.classList.add('active');
            showDetails(item.getAttribute('data-item'));
        } else {
            item.classList.remove('active');
        }
    }

    // 平滑旋转
    function smoothRotate(targetAngle, duration = 500) {
        cancelAnimationFrame(animationFrameId);
        
        const startAngle = currentAngle;
        const distance = calculateShortestRotation(startAngle, targetAngle);
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            currentAngle = startAngle + (distance * easeProgress);
            rotateCarousel(currentAngle);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                currentAngle = targetAngle; // 确保最终角度精确
                rotateCarousel(currentAngle);
            }
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // 旋转轮播
    function rotateCarousel(angle) {
        items.forEach((item, index) => {
            const itemAngle = angle + (angleStep * index);
            item.style.transform = `rotateY(${itemAngle}deg)`;
            updateItemStyle(item, itemAngle);
        });
    }

    // 显示详情
    function showDetails(itemId) {
        detailCards.forEach(card => {
            if (card.id === `${itemId}-details`) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    // 持续自动旋转
    function startAutoRotate() {
        if (isAutoRotating) return;
        isAutoRotating = true;
        
        let lastTime = performance.now();
        const rotationSpeed = 0.02;

        function autoRotateAnimation(currentTime) {
            if (!isAutoRotating) return;
            
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            if (Date.now() - lastInteractionTime > 2000) {
                // 使用增量式旋转，避免累积误差
                const rotationAmount = rotationSpeed * deltaTime;
                currentAngle -= rotationAmount;
                lastAutoRotateAngle = currentAngle;
                rotateCarousel(currentAngle);
            }

            autoRotateAnimationId = requestAnimationFrame(autoRotateAnimation);
        }

        autoRotateAnimationId = requestAnimationFrame(autoRotateAnimation);
    }

    function stopAutoRotate() {
        isAutoRotating = false;
        if (autoRotateAnimationId) {
            cancelAnimationFrame(autoRotateAnimationId);
            autoRotateAnimationId = null;
        }
    }

    function updateLastInteractionTime() {
        lastInteractionTime = Date.now();
        lastAutoRotateAngle = currentAngle;
    }

    // 处理拖动旋转
    function handleDrag(deltaX) {
        accumulatedDelta += deltaX;
        
        const rotationDelta = (accumulatedDelta / container.offsetWidth) * 45;
        
        if (Math.abs(rotationDelta) >= 1) {
            const newAngle = currentAngle + rotationDelta;
            currentAngle = newAngle;
            accumulatedDelta = 0;
            rotateCarousel(currentAngle);
        }
        
        velocity = deltaX * 0.3;
    }

    // 处理点击事件
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (!isDragging) {
                updateLastInteractionTime();
                const targetAngle = -angleStep * index;
                smoothRotate(targetAngle);
                currentIndex = index;
            }
        });
    });

    // 处理触摸事件
    let touchStartTime;
    let lastTouchX;
    
    container.addEventListener('touchstart', (e) => {
        updateLastInteractionTime();
        isDragging = true;
        touchStartTime = Date.now();
        startX = lastTouchX = e.touches[0].clientX;
        velocity = 0;
        accumulatedDelta = 0;
        cancelAnimationFrame(animationFrameId);
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        updateLastInteractionTime();
        
        const touchX = e.touches[0].clientX;
        const deltaX = touchX - lastTouchX;
        lastTouchX = touchX;
        
        handleDrag(deltaX);
        e.preventDefault();
    }, { passive: false });

    container.addEventListener('touchend', () => {
        updateLastInteractionTime();
        isDragging = false;
        
        function applyInertia() {
            if (Math.abs(velocity) > 0.1) {
                const inertiaRotation = velocity * 0.5;
                currentAngle += inertiaRotation;
                velocity *= friction;
                rotateCarousel(currentAngle);
                requestAnimationFrame(applyInertia);
            } else {
                const nearestAngle = Math.round(currentAngle / angleStep) * angleStep;
                smoothRotate(nearestAngle);
            }
        }
        
        requestAnimationFrame(applyInertia);
    });

    // 处理鼠标事件
    container.addEventListener('mousedown', (e) => {
        updateLastInteractionTime();
        isDragging = true;
        startX = lastX = e.clientX;
        velocity = 0;
        accumulatedDelta = 0;
        cancelAnimationFrame(animationFrameId);
        e.preventDefault();
        
        // 添加全局鼠标事件监听
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    });

    // 移动处理函数
    function handleMouseMove(e) {
        if (!isDragging) return;
        updateLastInteractionTime();
        
        const mouseX = e.clientX;
        const deltaX = mouseX - lastX;
        lastX = mouseX;
        
        handleDrag(deltaX);
    }

    // 松开处理函数
    function handleMouseUp() {
        if (!isDragging) return;
        updateLastInteractionTime();
        isDragging = false;
        
        // 移除全局事件监听
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // 对齐到最近的位置
        const nearestAngle = Math.round(currentAngle / angleStep) * angleStep;
        smoothRotate(nearestAngle);
    }

    // 移除原来的mousemove和mouseup事件监听
    container.removeEventListener('mousemove', handleMouseMove);
    container.removeEventListener('mouseup', handleMouseUp);

    container.addEventListener('mouseleave', () => {
        if (isDragging) {
            handleMouseUp(); // 使用相同的处理函数
        }
    });

    container.addEventListener('selectstart', (e) => {
        if (isDragging) {
            e.preventDefault();
        }
    });

    // 初始化
    initializePositions();
    startAutoRotate();

    // 处理窗口大小变化
    let resizeTimeout;
    window.addEventListener('resize', () => {
        updateLastInteractionTime();
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(initializePositions, 100);
    });

    // 鼠标悬停时暂停自动旋转
    container.addEventListener('mouseenter', () => {
        updateLastInteractionTime();
    });
}); 