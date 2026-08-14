// src/directives/highlight.js
import hljs from 'highlight.js';
import "highlight.js/styles/agate.min.css"
import ClipboardJS from 'clipboard';

const addLineNumbers = (el) => {
	const codeBlocks = el.querySelectorAll('pre code');
	codeBlocks.forEach((block) => {
		const lines = block.innerHTML.split('\n');
		if (lines[lines.length - 1] === '') {
			lines.pop();
		}
		block.innerHTML = lines.map((line, index) => {
			return `<span class="line-number">${index + 1}</span><span class="line-content">${line}</span>`;
		}).join('\n');
	});
};

const addCopyButton = (el) => {
	const preElements = el.querySelectorAll('pre');
	preElements.forEach((pre) => {
		const button = document.createElement('button');
		button.textContent = '复制代码';
		button.className = 'copy-button';
		button.style.padding = '0.3rem';
		button.style.margin = '0.5rem';
		button.style.fontSize = '0.7rem';
		button.style.borderRadius = '0.3rem';
		button.style.background = 'transparent';
		button.style.position = 'absolute';
		button.style.color = '#fff';
		button.style.top = '0';
		button.style.right = '0';
		pre.insertBefore(button, pre.firstChild);
		const clipboard = new ClipboardJS(button, {
			text: () => {
			  // 获取不带行号的代码
			  return Array.from(pre.querySelectorAll('code .line-content')).map(line => line.textContent).join('\n');
			}
		});

		clipboard.on('success', () => {
			button.textContent = '已复制';
			setTimeout(() => {
				button.textContent = '复制代码';
			}, 2000);
		});

		clipboard.on('error', () => {
			button.textContent = 'Error';
			setTimeout(() => {
				button.textContent = '复制代码';
			}, 2000);
		});
	});
};

const addCollapseFunctionality = (el) => {
	const preElements = el.querySelectorAll('pre');
	preElements.forEach((pre) => {
		const toggleButton = document.createElement('button');
		toggleButton.textContent = '收起';
		toggleButton.className = 'collapse-button';
		toggleButton.style.padding = '0.3rem';
		toggleButton.style.margin = '0.5rem';
		toggleButton.style.fontSize = '0.7rem';
		toggleButton.style.borderRadius = '0.3rem';
		toggleButton.style.background = 'transparent';
		toggleButton.style.color = '#fff';

		pre.insertBefore(toggleButton, pre.firstChild);
		toggleButton.addEventListener('click', () => {
			const codeElement = pre.querySelector('code');
			if (codeElement.style.display === 'none') {
				codeElement.style.display = 'block';
				toggleButton.textContent = '收起';
			} else {
				codeElement.style.display = 'none';
				toggleButton.textContent = '展开';
			}
		});
	});
};

const applyHighlighting = (el, binding) => {
	const codeBlocks = el.querySelectorAll('pre code');
	codeBlocks.forEach((block) => {
		if (binding.value) {
			block.textContent = binding.value;
		}
		hljs.highlightElement(block);
		addLineNumbers(el);
	});
	addCopyButton(el);
	addCollapseFunctionality(el);
};

export default {
	beforeMount(el, binding) {
		applyHighlighting(el, binding);
	},
	updated(el, binding) {
		applyHighlighting(el, binding);
	},
};
