/**
 * script.js
 * 2016~2025년 국내 디지털 도서관 연구 동향 분석 HTML 프레젠테이션 컨트롤러
 */

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let currentSlide = 0;

  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const slideSelect = document.getElementById('slideSelect');
  const slideBadge = document.getElementById('slideBadge');
  const progressBar = document.getElementById('progressBar');
  const btnFullscreen = document.getElementById('btnFullscreen');

  // URL Hash 지원 (#slide-1 ~ #slide-21)
  function getSlideFromHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#slide-')) {
      const num = parseInt(hash.replace('#slide-', ''), 10);
      if (!isNaN(num) && num >= 1 && num <= totalSlides) {
        return num - 1;
      }
    }
    return 0;
  }

  // 숫자 카운트업 애니메이션 (글자 깨짐 방지 & 부드러운 이징)
  function animateCountUps(slideElement) {
    const counters = slideElement.querySelectorAll('.counter-val');
    counters.forEach((el) => {
      const targetStr = el.getAttribute('data-target');
      if (!targetStr) return;

      const isFloat = targetStr.includes('.');
      const decimals = isFloat ? targetStr.split('.')[1].length : 0;
      const target = parseFloat(targetStr);
      if (isNaN(target)) return;

      const duration = 600; // ms
      const startTime = performance.now();
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutCubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = target * ease;

        if (isFloat) {
          el.textContent = `${prefix}${currentVal.toFixed(decimals)}${suffix}`;
        } else {
          el.textContent = `${prefix}${Math.round(currentVal)}${suffix}`;
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = `${prefix}${targetStr}${suffix}`;
        }
      }

      requestAnimationFrame(update);
    });
  }

  // 막대그래프 성장 애니메이션 (anime.js 스타일 모션)
  function animateStatBars(slideElement) {
    const bars = slideElement.querySelectorAll('.stat-bar-fill');
    bars.forEach((bar) => {
      const targetWidth = bar.getAttribute('data-width');
      if (!targetWidth) return;
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.width = targetWidth;
      }, 80);
    });
  }

  // 슬라이드 표시 함수
  function showSlide(index) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;

    slides.forEach((slide, idx) => {
      if (idx === index) {
        slide.classList.add('active');
        // 모션 애니메이션 트리거
        animateCountUps(slide);
        animateStatBars(slide);
      } else {
        slide.classList.remove('active');
      }
    });

    currentSlide = index;

    // UI 상태 업데이트
    const slideNumber = index + 1;
    if (slideBadge) {
      slideBadge.textContent = `${slideNumber} / ${totalSlides}`;
    }
    if (slideSelect) {
      slideSelect.value = index;
    }
    if (progressBar) {
      const pct = (slideNumber / totalSlides) * 100;
      progressBar.style.width = `${pct}%`;
    }

    // 이전/다음 버튼 상태
    if (btnPrev) btnPrev.disabled = index === 0;
    if (btnNext) btnNext.disabled = index === totalSlides - 1;

    // URL 해시 업데이트
    history.replaceState(null, null, `#slide-${slideNumber}`);
  }

  // 이전/다음 조작
  function prevSlide() {
    if (currentSlide > 0) {
      showSlide(currentSlide - 1);
    }
  }

  function nextSlide() {
    if (currentSlide < totalSlides - 1) {
      showSlide(currentSlide + 1);
    }
  }

  // 이벤트 리스너 등록
  if (btnPrev) btnPrev.addEventListener('click', prevSlide);
  if (btnNext) btnNext.addEventListener('click', nextSlide);

  if (slideSelect) {
    slideSelect.addEventListener('change', (e) => {
      const targetIndex = parseInt(e.target.value, 10);
      showSlide(targetIndex);
    });
  }

  // 전체화면 토글
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  // 학술지 / 발행기관 탭 전환 (Slide 15)
  const btnTabJournal = document.getElementById('btnTabJournal');
  const btnTabInst = document.getElementById('btnTabInst');
  const chartJournal = document.getElementById('chartJournal');
  const chartInst = document.getElementById('chartInst');

  if (btnTabJournal && btnTabInst && chartJournal && chartInst) {
    btnTabJournal.addEventListener('click', () => {
      chartJournal.style.display = 'block';
      chartInst.style.display = 'none';
      btnTabJournal.style.backgroundColor = 'var(--primary-light)';
      btnTabJournal.style.color = 'var(--primary)';
      btnTabJournal.style.fontWeight = 'bold';
      btnTabInst.style.backgroundColor = '';
      btnTabInst.style.color = '';
      btnTabInst.style.fontWeight = 'normal';
    });

    btnTabInst.addEventListener('click', () => {
      chartJournal.style.display = 'none';
      chartInst.style.display = 'block';
      btnTabInst.style.backgroundColor = 'var(--primary-light)';
      btnTabInst.style.color = 'var(--primary)';
      btnTabInst.style.fontWeight = 'bold';
      btnTabJournal.style.backgroundColor = '';
      btnTabJournal.style.color = '';
      btnTabJournal.style.fontWeight = 'normal';
    });
  }

  // 키보드 내비게이션
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        showSlide(0);
        break;
      case 'End':
        e.preventDefault();
        showSlide(totalSlides - 1);
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        if (btnFullscreen) btnFullscreen.click();
        break;
      default:
        break;
    }
  });

  // 터치 스와이프 지원
  let touchStartX = 0;
  let touchEndX = 0;
  const slideFrame = document.querySelector('.slide-frame');

  if (slideFrame) {
    slideFrame.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slideFrame.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      nextSlide();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      prevSlide();
    }
  }

  // 초기 슬라이드 렌더링
  const initialSlide = getSlideFromHash();
  showSlide(initialSlide);
});
