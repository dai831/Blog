---
Git Bash运行vue create xxx无法使用上下箭头选择
---

# Git Bash运行vue create xxx无法使用上下箭头选择



### 1、解决办法

C:\Program Files\Git\etc 文件下 找到 **bash.bashrc** 

```bash
在文件最底部加上   alias vue='winpty vue.cmd'
```

