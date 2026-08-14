// src/directives/waves.js
import './waves.css';
const createRipple = (event, el, color) => {
    const ripple = document.createElement('span');
    const size = Math.max(el.offsetWidth, el.offsetHeight);
    const rect = el.getBoundingClientRect();
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    ripple.style.backgroundColor = color || 'currentColor'; // 波纹颜色（不传递就使用默认值）
    ripple.className = 'waves-ripple';
    el.appendChild(ripple);
    setTimeout(() => {
        ripple.remove();
    }, 800);
};

export default {
    beforeMount(el, binding) {
        el.addEventListener('click', (event) => createRipple(event, el, binding.value));
    },
    unmounted(el) {
        el.removeEventListener('click', (event) => createRipple(event, el));
    },
};
