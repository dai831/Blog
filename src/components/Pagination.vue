<template>
    <div class="pagination flex_center">
        <el-pagination 
	    	background 
	    	:layout="layout" 
	    	v-model:currentPage="page.pageno"
	    	v-model:page-size="page.count"
	    	:page-sizes="[10, 20, 30, 40, 50]"
	    	:total="page.total"
	    	@size-change="handleSizeChange"
	    	@current-change="handleCurrentChange"
	    	/>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'

const props = defineProps({
    layout: {
        type: String,
        default: 'prev, pager, next'
    },
    page: {
        type: Object,
        require: true
    }
})

const emit = defineEmits(['onSizeChange','onCurrentChange']);

const handleSizeChange = (val) =>{
    emit('onSizeChange', val);
}
const handleCurrentChange = (val) =>{
    emit('onCurrentChange', val);
}
</script>
<style scoped>
.pagination{
	height: 4rem;
	line-height: 4rem;
	width: 100%;
	overflow: auto;
}
.pagination :deep(.btn-prev){
	background-color: #fff;
	border-radius: 8px;
}
.pagination :deep(.btn-next){
	background-color: #fff;
	border-radius: 8px;
} 
.pagination :deep(.el-pager > .number){
	background-color: #ddd;
	border-radius: 8px;
}
.pagination :deep(.el-pager > .is-active){
	background-image: linear-gradient(45deg, #90cf5b, #00afee);
	border-radius: 8px;
	color: red !important;
}
</style>