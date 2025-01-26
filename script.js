// 轮播图功能
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel-container');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    
    let currentSlide = 0;
    const slideCount = slides.length;

    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideCount;
        updateCarousel();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        updateCarousel();
    }

    // 自动轮播
    let autoSlide = setInterval(nextSlide, 5000);

    // 鼠标悬停时暂停自动轮播
    carousel.addEventListener('mouseenter', () => clearInterval(autoSlide));
    carousel.addEventListener('mouseleave', () => {
        autoSlide = setInterval(nextSlide, 5000);
    });

    // 按钮点击事件
    prevButton.addEventListener('click', () => {
        prevSlide();
        clearInterval(autoSlide);
    });

    nextButton.addEventListener('click', () => {
        nextSlide();
        clearInterval(autoSlide);
    });
});

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// 游客留言功能
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('guestbook-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // 防止表单默认提交行为

        const name = document.getElementById('name').value;
        const message = document.getElementById('message').value;

        // 发送留言到网站拥有者（这里可以使用 AJAX 或其他方式）
        fetch('https://your-server-endpoint.com/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, message })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('留言已发送！');
            } else {
                alert('发送失败，请重试。');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('发送失败，请重试。');
        });

        // 清空表单
        form.reset();
    });
});

// 搜索功能
document.querySelector('.search-container form').addEventListener('submit', function(e) {
    e.preventDefault();
    const searchInput = this.querySelector('input');
    if (searchInput.value.trim()) {
        alert('搜索功能正在开发中，敬请期待！');
    }
});
