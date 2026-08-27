---
el-menu: 解决刷新问题
---



# 1、解决方式

- `:key="currentRoute?.path"` 添加key值 保持刷新状态

```vue
<el-menu v-if="currentRoute?.children?.length" class="menu-content" :key="currentRoute?.path" router :unique-opened="true"
            :collapse-transition="false" :default-active="route.path" text-color="#333" active-text-color="#6280F5">
            <el-sub-menu v-for="level2 in currentRoute.children" :key="level2.path" :index="level2.path">
                <template #title>
                    {{ level2.meta?.title }}
                </template>

                <!-- 路由型三级 -->
                <template v-if="level2.meta?.level3 === 'route'">
                    <el-menu-item v-for="it in level2.children || []" :key="it.path"
                        :index="`${currentRoute.path}/${level2.path}/${it.path}`" @click="applyRouteTask(1, it)">
                        {{ it.meta?.title }}
                    </el-menu-item>
                </template>

                <!-- 数据型三级 -->
                <template v-else-if="level2.meta?.level3 === 'data'">
                    <el-menu-item v-for="task in dataMenus" :key="task.id"
                        :index="`${currentRoute.path}/${level2.path}/${task.id}`" @click="applyDataTask(task, true)">
                        {{ task.title }}
                    </el-menu-item>
                </template>
            </el-sub-menu>
        </el-menu>


```

